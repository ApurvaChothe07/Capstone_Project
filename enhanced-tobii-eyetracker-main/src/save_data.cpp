#include "save_data.h"

#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <fstream>
#include <iostream>
#include <cassert>
#include <cerrno>
#include <direct.h>
#include <thread>

// =========================================================
// Create directory if needed
// =========================================================

bool create_directory_if_needed(const std::string& path)
{
    if (_mkdir(path.c_str()) == 0)
    {
        return true;
    }

    if (errno == EEXIST)
    {
        return true;
    }

    std::cout
        << "ERROR: _mkdir failed for: "
        << path
        << " errno="
        << errno
        << std::endl;

    return false;
}

// =========================================================
// Generate timestamped filename
// =========================================================

std::string generate_timestamped_filename(
    const std::string& base_path,
    const std::string& extension)
{
    auto now = std::chrono::system_clock::now();

    auto time_t_now =
        std::chrono::system_clock::to_time_t(now);

    std::tm local_tm{};

    localtime_s(&local_tm, &time_t_now);

    std::stringstream filename;

    filename
        << base_path
        << std::put_time(&local_tm, "%Y%m%d_%H%M%S")
        << extension;

    return filename.str();
}

// =========================================================
// Create gaze file path
//
// Example:
//
// ../data/gaze_data/
//     2303065_2026-08-07/
//         intro.txt
// =========================================================

std::string create_gaze_file_path(
    const std::string& roll_no,
    const std::string& question)
{
    auto now = std::chrono::system_clock::now();
    auto time_t_now =
        std::chrono::system_clock::to_time_t(now);

    std::tm local_tm{};
    localtime_s(&local_tm, &time_t_now);

    char date_buffer[20] = {0};

    std::strftime(
        date_buffer,
        sizeof(date_buffer),
        "%Y-%m-%d",
        &local_tm
    );

    std::string date(date_buffer);

    // eyeTrack.exe is launched from the project root.
    std::string base_dir = "data";
    std::string gaze_dir = "data/gaze_data";
    std::string student_dir =
        gaze_dir + "/" + roll_no + "_" + date;

    std::cout << "Creating directory: "
              << base_dir << std::endl;

    if (!create_directory_if_needed(base_dir))
    {
        std::cout << "ERROR creating data directory."
                  << std::endl;
        return "";
    }

    std::cout << "Creating directory: "
              << gaze_dir << std::endl;

    if (!create_directory_if_needed(gaze_dir))
    {
        std::cout << "ERROR creating gaze_data directory."
                  << std::endl;
        return "";
    }

    std::cout << "Creating directory: "
              << student_dir << std::endl;

    if (!create_directory_if_needed(student_dir))
    {
        std::cout << "ERROR creating student directory."
                  << std::endl;
        return "";
    }

    std::string file_path =
        student_dir + "/" + question + ".txt";

    std::cout << "Gaze file path: "
              << file_path
              << std::endl;

    return file_path;
}

// =========================================================
// Gaze callback
// =========================================================

void gaze_point_callback(
    tobii_gaze_point_t const* gaze_point,
    void* /*user_data*/)
{
    if (gaze_point == nullptr)
    {
        return;
    }

    if (gaze_point->validity != TOBII_VALIDITY_VALID)
    {
        return;
    }

    // Only save when continuous recording is active
    if (!continuous_recording)
    {
        return;
    }

    // Get system time
    auto now = std::chrono::system_clock::now();

    auto time_t_now =
        std::chrono::system_clock::to_time_t(now);

    auto milliseconds =
        std::chrono::duration_cast<std::chrono::milliseconds>(
            now.time_since_epoch()
        ) % 1000;

    std::tm local_tm{};

    localtime_s(&local_tm, &time_t_now);

    std::stringstream time_string;

    time_string
        << std::put_time(
               &local_tm,
               "%Y-%m-%d %H:%M:%S"
           )
        << "."
        << std::setfill('0')
        << std::setw(3)
        << milliseconds.count();

    // Protect filename/file operation
    std::lock_guard<std::mutex> lock(data_mutex);

    if (current_data_filename.empty())
    {
        return;
    }

    std::ofstream saveFile(
        current_data_filename,
        std::ios::app
    );

    if (!saveFile.is_open())
    {
        std::cout
            << "WARNING: Could not open gaze file: "
            << current_data_filename
            << std::endl;

        return;
    }

    saveFile
        << time_string.str()
        << "\t"
        << gaze_point->timestamp_us
        << "\t"
        << gaze_point->position_xy[0]
        << "\t"
        << gaze_point->position_xy[1]
        << "\n";

    saveFile.close();

    flag_success = true;
}

// =========================================================
// Start continuous recording
// =========================================================

void start_continuous_recording(
    const std::string& roll_no,
    const std::string& question)
{
    if (continuous_recording)
    {
        std::cout
            << "Recording is already active!"
            << std::endl;

        return;
    }

    std::cout
        << "Preparing recording..."
        << std::endl;

    // Create directory and file path BEFORE locking shared data.
    std::string new_filename =
        create_gaze_file_path(
            roll_no,
            question
        );

    if (new_filename.empty())
    {
        std::cout
            << "ERROR: Could not create gaze file path."
            << std::endl;

        return;
    }

    std::cout
        << "Creating gaze file..."
        << std::endl;

    std::ofstream clearFile(
        new_filename,
        std::ios::trunc
    );

    if (!clearFile.is_open())
    {
        std::cout
            << "ERROR: Could not create gaze file:"
            << std::endl
            << new_filename
            << std::endl;

        return;
    }

    clearFile
        << "human_time\t"
        << "tobii_timestamp_us\t"
        << "x_position\t"
        << "y_position\n";

    clearFile.close();

    // Only update shared filename after file creation succeeds.
    {
        std::lock_guard<std::mutex> lock(data_mutex);

        current_data_filename = new_filename;
    }

    continuous_recording = true;

    std::cout
        << "\n===================================="
        << std::endl;

    std::cout
        << "RECORDING STARTED"
        << std::endl;

    std::cout
        << "Roll No.: "
        << roll_no
        << std::endl;

    std::cout
        << "Question: "
        << question
        << std::endl;

    std::cout
        << "File: "
        << new_filename
        << std::endl;

    std::cout
        << "===================================="
        << std::endl;
}
// =========================================================
// Stop continuous recording
// =========================================================

void stop_continuous_recording()
{
    if (!continuous_recording)
    {
        std::cout
            << "No continuous recording is active."
            << std::endl;

        return;
    }

    continuous_recording = false;

    // Give callback processing a moment to finish
    Sleep(50);

    std::lock_guard<std::mutex> lock(data_mutex);

    std::cout
        << "\n===================================="
        << std::endl;

    std::cout
        << "RECORDING STOPPED"
        << std::endl;

    std::cout
        << "Data saved to: "
        << current_data_filename
        << std::endl;

    std::cout
        << "===================================="
        << std::endl;
}

// =========================================================
// Continuous recording thread
// =========================================================

void continuous_recording_loop(
    tobii_device_t* device)
{
    std::cout
        << "Continuous recording thread started"
        << std::endl;

    while (program_running)
    {
        if (continuous_recording)
        {
            // Prevent another thread from processing
            // Tobii callbacks simultaneously.
            std::lock_guard<std::mutex> lock(
                tobii_callback_mutex
            );

            result =
                tobii_wait_for_callbacks(
                    1,
                    &device
                );

            if (result == TOBII_ERROR_NO_ERROR ||
                result == TOBII_ERROR_TIMED_OUT)
            {
                result =
                    tobii_device_process_callbacks(
                        device
                    );

                if (result != TOBII_ERROR_NO_ERROR)
                {
                    std::cout
                        << "Error processing callbacks: "
                        << result
                        << std::endl;
                }
            }

            Sleep(5);
        }
        else
        {
            Sleep(50);
        }
    }

    std::cout
        << "Continuous recording thread ended"
        << std::endl;
}

// =========================================================
// Burst recording
// =========================================================

void get_save_data(
    tobii_device_t* device,
    int timeLength)
{
    // Stop continuous recording first
    if (continuous_recording)
    {
        stop_continuous_recording();

        Sleep(100);
    }

    current_data_filename =
        generate_timestamped_filename(
            "data/gaze_data_",
            ".txt"
        );

    {
        std::lock_guard<std::mutex> lock(data_mutex);

        std::ofstream clearFile(
            current_data_filename,
            std::ios::trunc
        );

        if (!clearFile.is_open())
        {
            std::cout
                << "ERROR: Could not create burst file."
                << std::endl;

            return;
        }

        clearFile
            << "human_time\t"
            << "tobii_timestamp_us\t"
            << "x_position\t"
            << "y_position\n";
    }

    std::cout
        << "Starting burst data collection ("
        << timeLength
        << " callbacks)..."
        << std::endl;

    std::cout
        << "Data will be saved to: "
        << current_data_filename
        << std::endl;

    // Temporarily enable saving
    continuous_recording = true;

    for (int i = 0; i < timeLength; i++)
    {
        {
            std::lock_guard<std::mutex> lock(
                tobii_callback_mutex
            );

            result =
                tobii_wait_for_callbacks(
                    1,
                    &device
                );

            if (result == TOBII_ERROR_NO_ERROR ||
                result == TOBII_ERROR_TIMED_OUT)
            {
                result =
                    tobii_device_process_callbacks(
                        device
                    );
            }
        }

        Sleep(50);
    }

    continuous_recording = false;

    std::cout
        << "Burst data collection finished."
        << std::endl;

    if (flag_success)
    {
        if (index_suc < SUCCESS_TIME)
        {
            success[index_suc] = index_all;

            std::ofstream saveFile(
                "/data/index.txt",
                std::ios::app
            );

            if (saveFile.is_open())
            {
                saveFile
                    << index_all
                    << "\n";
            }

            index_suc++;
        }
    }

    index_all++;

    flag_success = false;

    std::cout
        << "Success: "
        << index_suc
        << ", Total: "
        << index_all
        << std::endl;
}

// =========================================================
// Start gaze stream
// =========================================================

void start_listen(
    tobii_device_t* device)
{
    result =
        tobii_gaze_point_subscribe(
            device,
            gaze_point_callback,
            nullptr
        );

    if (result != TOBII_ERROR_NO_ERROR)
    {
        std::cout
            << "ERROR: Could not subscribe to gaze point stream."
            << std::endl;

        return;
    }

    std::cout
        << "Gaze point stream subscription active"
        << std::endl;
}

// =========================================================
// Available streams
// =========================================================

void start_available_streams(
    tobii_device_t* device)
{
    start_listen(device);
}

// =========================================================
// Prepare continuous recording
// =========================================================

void prepare_continuous_recording()
{
    std::cout
        << "Continuous recording files are created "
        << "when a start command is received."
        << std::endl;
}

// =========================================================
// Show statistics
// =========================================================

void show_data_statistics()
{
    std::lock_guard<std::mutex> lock(data_mutex);

    if (current_data_filename.empty())
    {
        std::cout
            << "No active data file."
            << std::endl;

        return;
    }

    std::ifstream dataFile(
        current_data_filename
    );

    if (!dataFile.is_open())
    {
        std::cout
            << "Could not open current data file."
            << std::endl;

        return;
    }

    std::string line;

    int lineCount = 0;

    while (std::getline(dataFile, line))
    {
        lineCount++;
    }

    dataFile.close();

    if (lineCount > 1)
    {
        std::cout
            << "Data file contains "
            << (lineCount - 1)
            << " gaze samples."
            << std::endl;
    }
    else
    {
        std::cout
            << "Data file contains no gaze samples."
            << std::endl;
    }
}
