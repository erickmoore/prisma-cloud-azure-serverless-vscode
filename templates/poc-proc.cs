using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace Company.Function
{
    public class Proc
    {
        private readonly ILogger<Proc> _logger;

        public Proc(ILogger<Proc> logger)
        {
            _logger = logger;
        }

        [Function("Proc")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req)
        {
            Twistlock.Serverless.Init(_logger);

            string command = req.Query["command"];
            string args = req.Query["args"];

            if (string.IsNullOrEmpty(command))
            {
                command = "tcpping";
                args = "google.com";
            }

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = command,
                    Arguments = args,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (Process process = Process.Start(psi))
                {
                    string output = await process.StandardOutput.ReadToEndAsync();
                    string error = await process.StandardError.ReadToEndAsync();

                    process.WaitForExit();

                    // Log the error if any
                    if (!string.IsNullOrEmpty(error))
                    {
                        _logger.LogError("Command Error: {Error}", error);
                    }

                    // Replace \r\n with actual newlines
                    string formattedOutput = output.Replace("\r\n",Environment.NewLine);
            
                    return new OkObjectResult(formattedOutput)
                    {
                        ContentTypes = { "text/plain" }
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing command");
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }
    }
}