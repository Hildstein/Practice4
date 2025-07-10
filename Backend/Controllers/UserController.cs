using Backend.Data;
using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController] // атрибут/метка — помечает класс как Web API контроллер (обработка HTTP-запросов)
                    // (Упрощённая обработка данных: параметры из тела запроса, строки запроса и других источников автоматически подставляются в аргументы методов)
                    // В общем без [ApiController] пришлось бы вручную проверять, а все ли обязательные поля заполнены, а так это делается за меня
    [Route("api/[controller]")] // маршрут: адрес будет /api/User (User — имя этого контроллера) (задаёт путь по которому будет доступен контроллер)
    [Authorize] // 
    public class UserController : ControllerBase // ControllerBase — это специальный базовый класс из ASP.NET Core.
                                                 // В нём уже реализован весь “скелет” для работы с HTTP (запросы/ответы, коды ошибок, сериализация данных и прочее).
                                                 // Мой класс UserController наследует его и получает все эти возможности.
    {
        private readonly AppDbContext _context; // _context — это приватное поле (переменная внутри класса), через которое я работаю с базой данных.

        public UserController(AppDbContext context) // AppDbContext context — это параметр, который ASP.NET Core автоматически “подсовывает” мне через механизм Dependency Injection (внедрение зависимостей)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers() // async - нужна для асинхронности (выполнить такой-то запрос, не ожидая пока другой завершится и т.д.)
        {
            return await _context.Users // Сервер не будет ждать, пока бд вернёт данные, а займётся другими делами. Как только база ответит — код продолжит выполнение.
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    Phone = u.Phone,
                    Name = u.Name,
                    Resume = u.Resume,
                    Role = u.Role
                })
                .ToListAsync(); 
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(); // NotFound() — это специальный метод, который возвращает HTTP-ответ с кодом 404 (Not Found). (Наследуется из ControllerBase)
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Phone = user.Phone,
                Name = user.Name,
                Resume = user.Resume,
                Role = user.Role
            };
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