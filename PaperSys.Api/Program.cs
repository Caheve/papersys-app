using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using PaperSys.Api.Data;
using QuestPDF.Infrastructure;

QuestPDF.Settings.License = LicenseType.Community;

const string CorsPolicyName = "AllowFrontend";

var builder = WebApplication.CreateBuilder(args);




// Agregar servicios
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<PaperSysDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://papersys-app-tsd7.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });

    options.AddPolicy(CorsPolicyName,
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:5173",
                    "https://papersys-app-tsd7.vercel.app")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configurar pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders();

app.UseCors(CorsPolicyName);

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers().RequireCors(CorsPolicyName);

app.Run();

