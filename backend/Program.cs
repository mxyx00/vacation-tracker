using backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options => options.UseMySQL(connectionString!));

builder.Services.AddControllers();

// https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-10.0
builder.Services.AddCors(options => {options.AddPolicy("AllowFrontend", policy =>{ policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod();});});



var app = builder.Build();
app.UseCors("AllowFrontend");
app.MapControllers();
app.Run();