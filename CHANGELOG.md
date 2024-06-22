# Change Log

## [0.0.1]

- Initial release

### Added

- Make request to configured console endpoint to download package files
- Make request to endpoint to generate TW_POLICY variable
- Extract and process package file to pull current defender version
- Prompt for .csproj file to insert package dependencies
- Create or modify NuGet.config file to inject local package dependencies

---
## [0.0.2]

### Fixed

- Corrected formatting issues with NuGet.Config and csproj files

---
## [0.0.3]

### Added

- Reduced message noise on success
- Added some UI styling with icons
- Added new onboarding workflow

### Fixed

- Re-factored code to make it more readable

---
## [0.1.0]

### Added

- Use Azure Functions Extension to prompt for function app to create variable
- Added the ability to select files to instrument after installation
- Added status bar context to allow variable selection
- Added new command that will initialize Defender based on selected .CS files