using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MySql.EntityFrameworkCore.Extensions;

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options => options.UseMySQL(connectionString!));

builder.Services.AddControllers();

builder.Services.AddCors(options => {options.AddPolicy("AllowFrontend", policy =>{ policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod();});});

builder.Services.AddOpenApi();


var app = builder.Build();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();
app.Run();