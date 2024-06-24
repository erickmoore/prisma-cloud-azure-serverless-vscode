# Change Log

## [0.4.0]

- Initial release

### Added

- Install Serverless Defender
    - Download most recent bundle
    - Extract contents of bundle
    - Optionally update project file
    - Optionally update NuGet package imports
    - Optionally initialize Defender in existing functions
    - Create require App Service variable (TW_POLICY)
    - Optionally use Microsoft Azure Functions extension to prompt for key: value pair for TW_POLICY
- Optionally create 2 sample functions in project root
- Expose commands to execute most commands above

## [0.4.1]

### Fixed

- Corrected issue when trying to create TW_POLICY variable when none is found