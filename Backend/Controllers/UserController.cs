using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            return await _context.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    Phone = u.Phone,
                    Name = u.Name,
                    Resume = u.Resume,
                    About = u.About,
                    Role = u.Role
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Phone = user.Phone,
                Name = user.Name,
                Resume = user.Resume,
                About = user.About,
                Role = user.Role
            };
        }

        // Публичный профиль (для отображения работодателя/кандидата по id, без email, без лишнего)
        [AllowAnonymous]
        [HttpGet("public/{id}")]
        public async Task<ActionResult<PublicUserDto>> GetPublicProfile(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            if (user.Role == UserRole.Employer)
            {
                return new PublicUserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Phone = user.Phone,
                    About = user.About,
                    Role = user.Role
                };
            }
            else
            {
                return new PublicUserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Phone = user.Phone,
                    Resume = user.Resume,
                    Role = user.Role
                };
            }
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(UserDto dto)
        {
            var user = new User
            {
                Email = dto.Email,
                Phone = dto.Phone,
                Name = dto.Name,
                Resume = dto.Resume,
                About = dto.About,
                Role = dto.Role,
                PasswordHash = "" // нужно предусмотреть создание пароля отдельно!
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            dto.Id = user.Id;
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserDto dto)
        {
            if (id != dto.Id) return BadRequest();
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Email = dto.Email;
            user.Phone = dto.Phone;
            user.Name = dto.Name;
            user.Resume = dto.Resume;
            user.About = dto.About;
            user.Role = dto.Role;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("profile")]
        public async Task<ActionResult<UserDto>> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Phone = user.Phone,
                Name = user.Name,
                Resume = user.Role == UserRole.Candidate ? user.Resume : null,
                About = user.Role == UserRole.Employer ? user.About : null,
                Role = user.Role
            };
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UserDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.Name = dto.Name;
            user.Phone = dto.Phone;
            if (user.Role == UserRole.Candidate)
                user.Resume = dto.Resume;
            if (user.Role == UserRole.Employer)
                user.About = dto.About;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}