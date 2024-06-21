using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Text.Json;

namespace Company.Function
{
    public class DNS
    {
        private readonly ILogger<DNS> _logger;

        public DNS(ILogger<DNS> logger)
        {
            _logger = logger;
        }

        [Function("DNS")]
        public async Task<IActionResult> Run(
                [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req
            )
        {
            // Initialize Serverless Defender
            Twistlock.Serverless.Init(_logger);

            string site = req.Query["site"];

            if (string.IsNullOrEmpty(site)){ site = "https://www.google.com"; }
            if (!site.StartsWith("https://")) { site = "https://" + site; }

            HttpClient client = new HttpClient();

            try
            {
                Stopwatch stopwatch = new Stopwatch();
                stopwatch.Start();

                HttpResponseMessage response = await client.GetAsync(site);
                response.EnsureSuccessStatusCode();

                stopwatch.Stop();

                string responseBody = await response.Content.ReadAsStringAsync();

                var result = new
                {
                    Url = site,
                    ResponseCode = response.StatusCode,
                    ResponseTime = stopwatch.ElapsedMilliseconds + " ms"
                };

                // Serialize the result with indented formatting
                var options = new JsonSerializerOptions { WriteIndented = true };
                string jsonResponse = JsonSerializer.Serialize(result, options);

                return new OkObjectResult(jsonResponse);
            }
            catch (HttpRequestException e)
            {
                _logger.LogError(e, "Error accessing the site: {site}", site);
                return new BadRequestObjectResult($"Error accessing the site: {site}");
            }
        }
    }
}