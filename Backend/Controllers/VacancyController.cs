using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Backend.DTO;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/vacancies")]
    public class VacancyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VacancyController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResult<VacancyDto>>> GetVacancies(int page = 1, int pageSize = 15)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 15;

            var query = _context.Vacancies.Include(v => v.Employer);
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtoItems = items.Select(vacancy => new VacancyDto
            {
                Id = vacancy.Id,
                Title = vacancy.Title,
                Description = vacancy.Description,
                City = vacancy.City,
                EmployerId = vacancy.EmployerId,
                EmployerName = vacancy.Employer.Name,
                EmployerEmail = vacancy.Employer.Email,
                EmployerPhone = vacancy.Employer.Phone
            }).ToList();

            return new PaginatedResult<VacancyDto>
            {
                Items = dtoItems,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                HasMore = (page * pageSize) < totalCount
            };
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VacancyDto>> GetVacancy(int id)
        {
            var vacancy = await _context.Vacancies
                .Include(v => v.Employer)
                .FirstOrDefaultAsync(v => v.Id == id);
            if (vacancy == null) return NotFound();

            var dto = new VacancyDto
            {
                Id = vacancy.Id,
                Title = vacancy.Title,
                Description = vacancy.Description,
                City = vacancy.City,
                EmployerId = vacancy.EmployerId,
                EmployerName = vacancy.Employer.Name,
                EmployerEmail = vacancy.Employer.Email,
                EmployerPhone = vacancy.Employer.Phone
            };
            return dto;
        }

        [HttpPost]
        [Authorize(Roles = "Employer")]
        public async Task<ActionResult<Vacancy>> CreateVacancy(CreateVacancyRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var vacancy = new Vacancy
            {
                Title = request.Title,
                Description = request.Description,
                City = request.City,
                EmployerId = int.Parse(userIdClaim.Value)
            };

            _context.Vacancies.Add(vacancy);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetVacancy), new { id = vacancy.Id }, vacancy);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> UpdateVacancy(int id, CreateVacancyRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var existingVacancy = await _context.Vacancies.FindAsync(id);
            if (existingVacancy == null) return NotFound();
            if (existingVacancy.EmployerId != userId) return Forbid();

            existingVacancy.Title = request.Title;
            existingVacancy.Description = request.Description;
            existingVacancy.City = request.City;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Vacancies.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> DeleteVacancy(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var vacancy = await _context.Vacancies.FindAsync(id);
            if (vacancy == null) return NotFound();
            if (vacancy.EmployerId != userId) return Forbid();

            _context.Vacancies.Remove(vacancy);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("my")]
        [Authorize(Roles = "Employer")]
        public async Task<ActionResult<IEnumerable<VacancyDto>>> GetMyVacancies()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var vacancies = await _context.Vacancies
                .Where(v => v.EmployerId == userId)
                .Include(v => v.Employer)
                .ToListAsync();

            var dtoList = vacancies.Select(vacancy => new VacancyDto
            {
                Id = vacancy.Id,
                Title = vacancy.Title,
                Description = vacancy.Description,
                City = vacancy.City,
                EmployerId = vacancy.EmployerId,
                EmployerName = vacancy.Employer.Name,
                EmployerEmail = vacancy.Employer.Email,
                EmployerPhone = vacancy.Employer.Phone
            }).ToList();

            return dtoList;
        }
    }
}