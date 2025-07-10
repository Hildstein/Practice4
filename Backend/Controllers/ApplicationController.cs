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
    [Route("api/applications")]
    [Authorize]
    public class ApplicationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ApplicationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApplicationDto>>> GetApplications()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            var userId = int.Parse(userIdClaim.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            IQueryable<Application> query = _context.Applications
                .Include(a => a.Candidate)
                .Include(a => a.Vacancy)
                .ThenInclude(v => v.Employer);

            if (userRole == "Candidate")
            {
                // Candidates can only see their own applications
                query = query.Where(a => a.CandidateId == userId);
            }
            else if (userRole == "Employer")
            {
                // Employers can only see applications to their vacancies
                query = query.Where(a => a.Vacancy.EmployerId == userId);
            }
            else
            {
                return Forbid();
            }

            var applications = await query.ToListAsync();
            
            return applications.Select(a => new ApplicationDto
            {
                Id = a.Id,
                VacancyId = a.VacancyId,
                VacancyTitle = a.Vacancy.Title,
                CandidateId = a.CandidateId,
                CandidateName = a.Candidate.Name,
                CandidateResume = a.Candidate.Resume,
                AppliedAt = a.AppliedAt,
                Status = a.Status
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApplicationDto>> GetApplication(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            var userId = int.Parse(userIdClaim.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var application = await _context.Applications
                .Include(a => a.Candidate)
                .Include(a => a.Vacancy)
                .ThenInclude(v => v.Employer)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null) return NotFound();

            // Check if user has access to this application
            bool hasAccess = userRole == "Candidate" && application.CandidateId == userId ||
                           userRole == "Employer" && application.Vacancy.EmployerId == userId;

            if (!hasAccess) return Forbid();

            return new ApplicationDto
            {
                Id = application.Id,
                VacancyId = application.VacancyId,
                VacancyTitle = application.Vacancy.Title,
                CandidateId = application.CandidateId,
                CandidateName = application.Candidate.Name,
                CandidateResume = application.Candidate.Resume,
                AppliedAt = application.AppliedAt,
                Status = application.Status
            };
        }

        [HttpPost]
        [Authorize(Roles = "Candidate")]
        public async Task<ActionResult<ApplicationDto>> CreateApplication(CreateApplicationRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            var userId = int.Parse(userIdClaim.Value);

            // Check if candidate has an active application to this vacancy
            var existingApplication = await _context.Applications
                .FirstOrDefaultAsync(a => a.VacancyId == request.VacancyId && a.CandidateId == userId 
                    && (a.Status == ApplicationStatus.New || a.Status == ApplicationStatus.Accepted));
            if (existingApplication != null)
                return BadRequest("У вас уже есть активный отклик на эту вакансию");

            var vacancy = await _context.Vacancies.FindAsync(request.VacancyId);
            if (vacancy == null) return BadRequest("Вакансия не найдена");

            // Candidates cannot apply to their own vacancies (if they're also employers)
            if (vacancy.EmployerId == userId) 
                return BadRequest("Нельзя откликаться на собственную вакансию");

            var application = new Application
            {
                VacancyId = request.VacancyId,
                CandidateId = userId,
                AppliedAt = DateTime.UtcNow,
                Status = ApplicationStatus.New
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            var result = new ApplicationDto
            {
                Id = application.Id,
                VacancyId = application.VacancyId,
                CandidateId = application.CandidateId,
                AppliedAt = application.AppliedAt,
                Status = application.Status
            };

            return CreatedAtAction(nameof(GetApplication), new { id = application.Id }, result);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> UpdateApplicationStatus(int id, ApplicationStatus status)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            var userId = int.Parse(userIdClaim.Value);

            var application = await _context.Applications
                .Include(a => a.Vacancy)
                .FirstOrDefaultAsync(a => a.Id == id);
            
            if (application == null) return NotFound();
            if (application.Vacancy.EmployerId != userId) return Forbid();

            application.Status = status;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/withdraw")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> WithdrawApplication(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            var userId = int.Parse(userIdClaim.Value);

            var application = await _context.Applications.FindAsync(id);
            if (application == null) return NotFound();
            if (application.CandidateId != userId) return Forbid();

            // Can only withdraw if status is New or Accepted
            if (application.Status != ApplicationStatus.New && application.Status != ApplicationStatus.Accepted)
                return BadRequest("Нельзя отозвать отклик с таким статусом");

            application.Status = ApplicationStatus.Withdrawn;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> DeleteApplication(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            var userId = int.Parse(userIdClaim.Value);

            var application = await _context.Applications.FindAsync(id);
            if (application == null) return NotFound();
            if (application.CandidateId != userId) return Forbid();

            _context.Applications.Remove(application);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}