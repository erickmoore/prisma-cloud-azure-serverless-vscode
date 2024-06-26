# Prisma Cloud VSCode Azure Serverless Extension

## Overview

This extension will download the required packages from your Prisma Cloud console, add the files to your current project, modify the selected .csproj file, and edit or create a NuGet.Config with local package imports. 
You will be prompted to enter the function name, and this is used to generate an environment variable that will be used in your App Service to identify the deployed Serverless Defender. Optionally you may choose to 
install sample C# functions to use for testing purposes. 

> This is a community supported project and has no affiliation with Palo Alto Networks Prisma Cloud

## Requirements

- Active Prisma Cloud subscription
- Credentials with the ability to create and download serverless package binaries
- Path to Prisma Cloud runtime console
    - > Runtime Security > Manage > System > Utilities, scroll to the bottom to retrieve console URL. 

## Recommended

- Azure Function Extension 
    - This extension will call the Azure Function Extension to automate creation of the required App Service environment variable

## Extension Settings

This extension contributes the following settings:

 | id |  setting  | type | description |
 |----|-----------|------|-------------|
 | PrismaCloudEnt.console | Prisma Cloud Console URL | `string` | Console URL used to authenticate against your environment.
 | PrismaCloudEnt.identity | Prisma Cloud Identity | `string` | Username or access key with the ability to download serverless packages from console.
 | PrismaCloudEnt.secret | Prisma Cloud Secret | `string` | Password for username or access key above

## Known Issues

* Testing has only been done on .NET 8 serverless function deployed using the Azure Functions VS Code plugin
* We do not look for the NuGet.Config file except the root directory
* We do not look for the .csproj file except in the root directory
* Current serverless initialization relies on regex to find where to insert the Defender so results will vary
* Download defender command not yet enabled due to requiring a different return than the existing implementation that also extracts the file

## Look Ahead

Please make feature requests on the GitHub repo here. These are the currently planned updates.

- Move regex matching for .CS files to Rosyln for better accuracy
- Improve settings to move API key to secret storage
- Support for App-Embeded Defender
- VS Code Side Pannel Support
    - View serverless audit logs for protected functions in your project
    - View protected and un-protected functions in a project