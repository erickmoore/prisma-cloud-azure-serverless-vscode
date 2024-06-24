using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Threading.Tasks;

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
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req)
        {
            Twistlock.Serverless.Init(_logger);

            string urlParameter1 = "command";
            string command = req.Query[urlParameter1].ToString();

            string urlParameter2 = "args";
            string args = req.Query[urlParameter2].ToString();

            if (string.IsNullOrEmpty(command))
            {
                command = "tcpping";
                args = "google.com";
            }

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = command ?? throw new ArgumentNullException(nameof(command)),
                    Arguments = args ?? string.Empty,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                Process? process = Process.Start(psi);
                if (process == null)
                {
                    _logger.LogError("Process start failed");
                    return new StatusCodeResult(StatusCodes.Status500InternalServerError);
                }

                using (process)
                {
                    string output = await process.StandardOutput.ReadToEndAsync();
                    string error = await process.StandardError.ReadToEndAsync();

                    await process.WaitForExitAsync();

                    // Log the error if any
                    if (!string.IsNullOrEmpty(error))
                    {
                        _logger.LogError("Command Error: {Error}", error);
                    }

                    // Replace \r\n with actual newlines
                    string formattedOutput = output.Replace("\r\n", Environment.NewLine);

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