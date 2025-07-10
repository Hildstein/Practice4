using System.Security.Cryptography;
using System.Text;
using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwtService;

        public AuthController(AppDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register/candidate")]
        public async Task<IActionResult> RegisterCandidate(CandidateRegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email уже используется");
            if (await _context.Users.AnyAsync(u => u.Phone == request.Phone))
                return BadRequest("Телефон уже используется");

            var user = new User
            {
                Email = request.Email,
                Phone = request.Phone,
                Name = request.Name,
                Resume = request.Resume,
                PasswordHash = HashPassword(request.Password),
                Role = UserRole.Candidate
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok("Кандидат зарегистрирован");
        }

        [HttpPost("register/employer")]
        public async Task<IActionResult> RegisterEmployer(EmployerRegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email уже используется");
            if (await _context.Users.AnyAsync(u => u.Phone == request.Phone))
                return BadRequest("Телефон уже используется");

            var user = new User
            {
                Email = request.Email,
                Phone = request.Phone,
                Name = request.Name,
                Resume = null, // Employers don't have resumes
                About = request.About,
                PasswordHash = HashPassword(request.Password),
                Role = UserRole.Employer
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok("Работодатель зарегистрирован");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(DTO.LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
                return Unauthorized("Неверный email или пароль");

            var token = _jwtService.GenerateToken(user);
            return Ok(new { token });
        }

        // Пример простой хэш-функции
        private static string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private static bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }
    }
}