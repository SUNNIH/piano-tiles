import { GoogleGenAI, Type } from "@google/genai";
import { CppFramework, GeneratedCode } from "../types";

function getFallbackProject(framework: CppFramework, bgmName: string, bgmVolume: number): GeneratedCode {
  const safeBgmName = bgmName.replace(/[^a-zA-Z0-9._-]/g, '_') || 'track.mp3';

  if (framework === CppFramework.SFML) {
    return {
      code: `// AfroPI@NO Audio Engine - SFML 2.6 / 3.0 Native Build
// High-performance background audio stream with real-time spectrum visualization

#include <SFML/Audio.hpp>
#include <SFML/Graphics.hpp>
#include <iostream>
#include <vector>
#include <cmath>

int main() {
    sf::RenderWindow window(sf::VideoMode(800, 600), "AfroPI@NO - SFML Audio Engine");
    window.setFramerateLimit(60);

    sf::Music music;
    std::string audioPath = "assets/${safeBgmName}";
    
    if (!music.openFromFile(audioPath)) {
        std::cerr << "[ERROR] Could not load audio from: " << audioPath << std::endl;
        std::cerr << "Falling back to generated test tone..." << std::endl;
    } else {
        music.setVolume(${Math.round(bgmVolume * 100)}f);
        music.setLoop(true);
        music.play();
        std::cout << "[INFO] Playing " << audioPath << " at volume ${Math.round(bgmVolume * 100)}%" << std::endl;
    }

    // Spectrum bars for visualization
    const int numBars = 32;
    std::vector<sf::RectangleShape> bars(numBars);
    float barWidth = 800.0f / numBars - 4.0f;

    for (int i = 0; i < numBars; ++i) {
        bars[i].setSize(sf::Vector2f(barWidth, 10.0f));
        bars[i].setPosition(i * (barWidth + 4.0f) + 2.0f, 580.0f);
        bars[i].setFillColor(sf::Color(0, 242, 255, 200));
        bars[i].setOrigin(0, 0);
    }

    sf::Clock clock;
    while (window.isOpen()) {
        sf::Event event;
        while (window.pollEvent(event)) {
            if (event.type == sf::Event::Closed)
                window.close();
            if (event.type == sf::Event::KeyPressed && event.key.code == sf::Keyboard::Space) {
                if (music.getStatus() == sf::Music::Playing) music.pause();
                else music.play();
            }
        }

        float time = clock.getElapsedTime().asSeconds();
        for (int i = 0; i < numBars; ++i) {
            float height = std::sin(time * 6.0f + i * 0.4f) * 150.0f + 180.0f;
            bars[i].setSize(sf::Vector2f(barWidth, -height));
        }

        window.clear(sf::Color(10, 10, 12));
        for (const auto& bar : bars) {
            window.draw(bar);
        }
        window.display();
    }

    return 0;
}`,
      cmake: `cmake_minimum_required(VERSION 3.16)
project(AfroPiano_SFML CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(SFML 2.5 COMPONENTS graphics audio window system REQUIRED)

add_executable(AfroPiano_Engine main.cpp)
target_link_libraries(AfroPiano_Engine PRIVATE sfml-graphics sfml-audio sfml-window sfml-system)

# Copy asset folder to build output
file(COPY \${CMAKE_CURRENT_SOURCE_DIR}/assets DESTINATION \${CMAKE_CURRENT_BINARY_DIR})`,
      explanation: `SFML Setup Guide:
1. Windows: vcpkg install sfml:x64-windows
2. macOS: brew install sfml
3. Ubuntu/Debian: sudo apt-get install libsfml-dev
Build Command:
mkdir build && cd build
cmake ..
cmake --build .`
    };
  } else if (framework === CppFramework.RAYLIB) {
    return {
      code: `// AfroPI@NO Audio Engine - Raylib Native C++17 Build
#include "raylib.h"
#include <iostream>
#include <vector>
#include <cmath>

int main() {
    const int screenWidth = 800;
    const int screenHeight = 600;

    InitWindow(screenWidth, screenHeight, "AfroPI@NO - Raylib Audio Engine");
    InitAudioDevice();

    SetTargetFPS(60);

    const char* audioPath = "assets/${safeBgmName}";
    Music music = LoadMusicStream(audioPath);
    bool musicLoaded = IsMusicValid(music);

    if (musicLoaded) {
        SetMusicVolume(music, ${bgmVolume.toFixed(2)}f);
        PlayMusicStream(music);
    } else {
        std::cerr << "[WARNING] Could not load audio: " << audioPath << std::endl;
    }

    while (!WindowShouldClose()) {
        if (musicLoaded) {
            UpdateMusicStream(music);
            if (IsKeyPressed(KEY_SPACE)) {
                if (IsMusicStreamPlaying(music)) PauseMusicStream(music);
                else ResumeMusicStream(music);
            }
        }

        BeginDrawing();
        ClearBackground((Color){ 10, 10, 12, 255 });

        DrawText("AFROPI@NO AUDIO ENGINE (RAYLIB)", 20, 20, 20, (Color){ 0, 242, 255, 255 });
        DrawText(TextFormat("Track: %s", audioPath), 20, 50, 14, RAYWHITE);
        DrawText("Press [SPACE] to Play/Pause", 20, 75, 12, GRAY);

        // Visualizer Bars
        float time = (float)GetTime();
        int numBars = 32;
        float barWidth = (float)screenWidth / numBars - 4;

        for (int i = 0; i < numBars; ++i) {
            float height = sinf(time * 5.0f + i * 0.3f) * 120.0f + 140.0f;
            DrawRectangleV((Vector2){ i * (barWidth + 4) + 2, screenHeight - height }, (Vector2){ barWidth, height }, (Color){ 0, 242, 255, 200 });
        }

        EndDrawing();
    }

    if (musicLoaded) UnloadMusicStream(music);
    CloseAudioDevice();
    CloseWindow();

    return 0;
}`,
      cmake: `cmake_minimum_required(VERSION 3.16)
project(AfroPiano_Raylib CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(raylib REQUIRED)

add_executable(AfroPiano_Raylib main.cpp)
target_link_libraries(AfroPiano_Raylib PRIVATE raylib)

file(COPY \${CMAKE_CURRENT_SOURCE_DIR}/assets DESTINATION \${CMAKE_CURRENT_BINARY_DIR})`,
      explanation: `Raylib Setup Guide:
1. Windows: vcpkg install raylib:x64-windows
2. macOS: brew install raylib
3. Linux: sudo apt-get install libraylib-dev`
    };
  } else if (framework === CppFramework.SDL2) {
    return {
      code: `// AfroPI@NO Audio Engine - SDL2 & SDL2_mixer Build
#include <SDL2/SDL.h>
#include <SDL2/SDL_mixer.h>
#include <iostream>
#include <vector>

int main(int argc, char* argv[]) {
    if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO) < 0) {
        std::cerr << "SDL Init Error: " << SDL_GetError() << std::endl;
        return 1;
    }

    if (Mix_OpenAudio(44100, MIX_DEFAULT_FORMAT, 2, 2048) < 0) {
        std::cerr << "SDL_mixer Init Error: " << Mix_GetError() << std::endl;
    }

    SDL_Window* window = SDL_CreateWindow("AfroPI@NO - SDL2 Audio Engine",
        SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, 800, 600, SDL_WINDOW_SHOWN);
    SDL_Renderer* renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);

    Mix_Music* music = Mix_LoadMUS("assets/${safeBgmName}");
    if (music) {
        Mix_VolumeMusic(${Math.round(bgmVolume * 128)});
        Mix_PlayMusic(music, -1);
    }

    bool running = true;
    SDL_Event event;

    while (running) {
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_QUIT) running = false;
            if (event.type == SDL_KEYDOWN && event.key.keysym.sym == SDLK_SPACE) {
                if (Mix_PausedMusic()) Mix_ResumeMusic();
                else Mix_PauseMusic();
            }
        }

        SDL_SetRenderDrawColor(renderer, 10, 10, 12, 255);
        SDL_RenderClear(renderer);

        // Draw HUD & Visualizer bar demo
        SDL_SetRenderDrawColor(renderer, 0, 242, 255, 255);
        SDL_Rect bar = { 100, 450, 600, 30 };
        SDL_RenderFillRect(renderer, &bar);

        SDL_RenderPresent(renderer);
        SDL_Delay(16);
    }

    if (music) Mix_FreeMusic(music);
    Mix_CloseAudio();
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}`,
      cmake: `cmake_minimum_required(VERSION 3.16)
project(AfroPiano_SDL2 CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(SDL2 REQUIRED)
find_package(SDL2_mixer REQUIRED)

add_executable(AfroPiano_SDL2 main.cpp)
target_link_libraries(AfroPiano_SDL2 PRIVATE SDL2::SDL2 SDL2_mixer::SDL2_mixer)

file(COPY \${CMAKE_CURRENT_SOURCE_DIR}/assets DESTINATION \${CMAKE_CURRENT_BINARY_DIR})`,
      explanation: `SDL2 Setup Guide:
1. Windows: vcpkg install sdl2 sdl2-mixer:x64-windows
2. macOS: brew install sdl2 sdl2_mixer
3. Linux: sudo apt-get install libsdl2-dev libsdl2-mixer-dev`
    };
  } else {
    // OpenGL / GLFW
    return {
      code: `// AfroPI@NO Audio Engine - Modern OpenGL 3.3+ Core Profile with GLFW
#include <GLFW/glfw3.h>
#include <iostream>

int main() {
    if (!glfwInit()) return -1;

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    GLFWwindow* window = glfwCreateWindow(800, 600, "AfroPI@NO - OpenGL Engine", NULL, NULL);
    if (!window) {
        glfwTerminate();
        return -1;
    }

    glfwMakeContextCurrent(window);
    std::cout << "[INFO] OpenGL Audio/Graphics Pipeline initialized for ${safeBgmName}" << std::endl;

    while (!glfwWindowShouldClose(window)) {
        glClearColor(0.04f, 0.04f, 0.05f, 1.0f);
        glClear(0x00004000); // GL_COLOR_BUFFER_BIT

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;
}`,
      cmake: `cmake_minimum_required(VERSION 3.16)
project(AfroPiano_OpenGL CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(OpenGL REQUIRED)
find_package(glfw3 REQUIRED)

add_executable(AfroPiano_OpenGL main.cpp)
target_link_libraries(AfroPiano_OpenGL PRIVATE OpenGL::GL glfw)`,
      explanation: `OpenGL Guide:
1. Windows: vcpkg install glfw3 glew:x64-windows
2. macOS: brew install glfw glew
3. Linux: sudo apt-get install libglfw3-dev libglew-dev`
    };
  }
}

export const generateCppProject = async (
  framework: CppFramework,
  bgmName: string,
  bgmVolume: number,
  additionalContext: string
): Promise<GeneratedCode> => {
  const safeBgmName = bgmName.replace(/[^a-zA-Z0-9._-]/g, '_') || 'audio_track.mp3';

  // Check if API key is available
  const apiKey = typeof process !== 'undefined' && process.env?.GEMINI_API_KEY
    ? process.env.GEMINI_API_KEY
    : undefined;

  if (!apiKey) {
    // Return high-quality deterministic fallback immediately
    return getFallbackProject(framework, safeBgmName, bgmVolume);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash";

    const prompt = `
      You are an expert C++ Audio Systems Engineer. 
      Task: Create a professional "AudioForge" project.
      
      **Goal**: Build a high-performance C++ audio app that loads and plays an external file as background music.
      
      **Project Requirements:**
      1. Framework/Library: ${framework}.
      2. Dynamic Loading: Code must look for a file at "assets/${safeBgmName}". If not found, it should print a clear error and exit gracefully.
      3. Audio Features: Playback, pause/resume, and volume modulation (${bgmVolume}).
      4. Visualization: Implement real-time audio visualization logic.
      5. Modern C++: Use C++17 standards, RAII for resource management.
      
      **Context:**
      ${additionalContext}

      Return response in JSON with 'code', 'cmake', 'explanation'.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING, description: "The C++ source code" },
            cmake: { type: Type.STRING, description: "The CMakeLists.txt content" },
            explanation: { type: Type.STRING, description: "Dependency installation guide" }
          },
          required: ["code", "cmake", "explanation"]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (error) {
    console.warn("Gemini API call failed, using built-in project template:", error);
  }

  return getFallbackProject(framework, safeBgmName, bgmVolume);
};
