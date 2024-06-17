# Prisma Cloud VSCode Azure Serverless Extension
---

## Overview

This extension will download the required packages from your Prisma Cloud console, add the files to your current project, modify the selected .csproj file, and edit or create a NuGet.Config with local package imports. 
You will be prompted to enter the function name, and this is used to generate an environment variable that will be used in your App Service to identify the deployed Serverless Defender.

> This is a community supported project and is not officially supported by Palo Alto Networks

## Requirements

Active Prisma Cloud subscription

## Extension Settings

This extension contributes the following settings:

 | id |  setting  | type | description |
 |----|-----------|------|-------------|
 | serverlessPrismaCloud.console | Prisma Cloud Console URL | `string` | 
 | serverlessPrismaCloud.identity | Prisma Cloud Identity | `string` | 
 | serverlessPrismaCloud.secret | Prisma Cloud Secret | `string` | 

## Known Issues

This has only been tested with .NET 8 serverless function deployed using the Azure Functions VS Code plugin.
We do not prompt for a NuGet.Config currently and instead will either edit one in the root or create a new file in the root.
We do not look for the .csproj file except in the root directory.


## Look Ahead

Please make feature requests on the GitHub repo here. These are the currently planned updates.

- Support for App-Embeded Deployment
- VS Code Side Pannel Support
    - View serverless audit logs for protected functions in your project
    - View protected and un-protected functions in a project
    - Prompt for App Service name by reading settings from Azure Serverless Extension
    - Present list of functions in project to select for intrumentation
