using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using PaperSys.Api.Data;
using QuestPDF.Infrastructure;


QuestPDF.Settings.License = LicenseType.Community;

const string CorsPolicyName = "AllowFrontend";
string[] allowedOrigins =
[
    "https://papersys-app-tsd7.vercel.app",
    "https://papersys-app.onrender.com",
    "http://localhost:5173",
    "https://localhost:5173"
];

var builder = WebApplication.CreateBuilder(args);

// Servicios
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

Console.WriteLine("CONNECTION STRING:");
Console.WriteLine(connectionString);

builder.Services.AddDbContext<PaperSysDbContext>(options =>
    options.UseNpgsql(
    builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto;
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine("ERROR GLOBAL:");
        Console.WriteLine(ex.ToString());
        throw;
    }
});

// Pipeline

app.UseSwagger();
app.UseSwaggerUI();


app.UseForwardedHeaders();

app.UseCors(CorsPolicyName);

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapGet("/health", () =>
    Results.Ok(new { status = "ok" }));

app.MapControllers().RequireCors(CorsPolicyName);

/* using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PaperSysDbContext>();
    db.Database.Migrate();
}
 */
app.Run();
