# 

This folder contains sample functions written in C# for deployment to an Azure Function App using the .Net 8 Isolated runtime. These functions can be used to test serverless runtime protection using Prisma Cloud. 

> [!CAUTION]
> It is not recommended to use these functions for any production use as they are insecure by design.

---

## Contents

- [DNS Function](#dns-function)
- [Process Function](#process-function)
  <!-- - Function
  - Parameters
  - Example cURL
  - Response
  - Example cURL with Parameters
  - Response with Parameters -->


### DNS Function

 | name      |  requirement  | type | description |
 |-----------|---------|-------|--------|
 | DNS      |  `required` | `.NET 8 Function` | Issues a GET request to a website and returns response<br> time and response code. If no parameter is passed the<br> default request is made to https://www.google.com |

 #### Parameters
---

 | name      |  requirement  | type | description |
 |-----------|---------|----------|--------|
 | site      |  `optional` | `string` | Public DNS name of a website to test a GET request |

##### Example cURL Usage

```Shell
curl -X GET "https://yourFunctionName.azurewebsites.net/api/DNS"
```

##### Response

```JSON
{
 "Url": "https://www.google.com",
 "ResponseCode": 200,
 "ResponseTime": "406 ms"
}
```

##### Example cURL Usage with Parameter

```Shell
curl -X GET "https://yourFunctionName.azurewebsites.net/api/DNS?site=https://www.microsoft.com"
```

##### Response with Parameter
```JSON
{
  "Url": "https://www.microsoft.com",
  "ResponseCode": 200,
  "ResponseTime": "211 ms"
}
```

---

### Process Function

 | name      |  requirement  | type | description |
 |-----------|---------|----------------|------------------|
 | Proc     |  `required` | `.NET 8 Function` | Runs a command on the system where the code is running.<br> If no parameter is passed the default process that is executed<br> is 'tcpping google.com'. |

 #### Parameters
---

 | name      |  requirement  | type | description |
 |-----------|---------|----------|--------|
 | command |  `optional` | `string` | Name of the process to execute. |
 | args |  `command` | `string` | Arguments passed to the executed command. |

##### Example cURL Usage

```Shell
curl -X GET "https://yourFunctionName.azurewebsites.net/api/Proc"
```

##### Response

```Shell
Connected to google.com:80, time taken: 15ms
Connected to google.com:80, time taken: <1ms
Connected to google.com:80, time taken: <1ms
Connected to google.com:80, time taken: <1ms
Complete: 4/4 successful attempts (100%). Average success time: 3.75ms
```

##### Example cURL Usage with Parameter

```shell
curl -X GET "https://yourFunctionName.azurewebsites.net/api/Proc?command=powershell&args=ls"
```

##### Response with Parameter

```Shell
   Directory: C:\local\Temp\functions\standby\wwwroot


Mode                 LastWriteTime         Length Name                         
----                 -------------         ------ ----                         
d-----         6/10/2024   1:58 PM                WarmUp                       
-a----         6/10/2024   1:58 PM            141 host.json                    
-a----         6/10/2024   1:58 PM            482 proxies.json
```
---



<!-- ## Add to azurefunction.csproj

```xml
  <ItemGroup>
    <PackageReference Include="Twistlock" Version="32.06.110" />
    <TwistlockFiles Include="twistlock\*" Exclude="twistlock\twistlock.32.06.110.nupkg" />
  </ItemGroup>
  <ItemGroup>
    <None Include="@(TwistlockFiles)" CopyToOutputDirectory="Always" LinkBase="twistlock\" />
  </ItemGroup>
  ```
  
  ## Add the local-packages reference to TwistLock in NuGet.Config under packageSources

  ```xml
    <configuration>
        <packageSources>
            <add key="local-packages" value="./twistlock/" />
        </packageSources>
    </configuration>
```

  ## If NuGet.Config does not exist, create a file named NuGet.Config and add the following contents:

  ```xml
  <?xml version="1.0" encoding="utf-8"?>
    <configuration>
        <packageSources>
            <clear />
            <add key="local-packages" value="./twistlock/" />
            <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
        </packageSources>
    </configuration>
``` -->