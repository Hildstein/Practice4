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
    [Route("api/messages")]
    [Authorize]
    public class MessageController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessageController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("vacancy/{vacancyId}/candidate/{candidateId}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages(int vacancyId, int candidateId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Проверка доступа: кандидат может читать только если он этот кандидат,
            // работодатель — только если эта вакансия его
            var vacancy = await _context.Vacancies.FindAsync(vacancyId);
            if (vacancy == null) return NotFound();

            if (!(userRole == "Candidate" && candidateId == userId ||
                  userRole == "Employer" && vacancy.EmployerId == userId))
            {
                return Forbid();
            }

            var messages = await _context.Messages
                .Where(m => m.VacancyId == vacancyId && m.CandidateId == candidateId)
                .Include(m => m.Sender)
                .OrderBy(m => m.SentAt)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    VacancyId = m.VacancyId,
                    CandidateId = m.CandidateId,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.Name,
                    Content = m.Content,
                    SentAt = m.SentAt
                })
                .ToListAsync();

            return messages;
        }

        // Отправка сообщения в чат
        [HttpPost]
        public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Доступ: кандидат может писать только если сам кандидат, работодатель — если его вакансия
            var vacancy = await _context.Vacancies.FindAsync(request.VacancyId);
            if (vacancy == null) return BadRequest("Вакансия не найдена");

            if (!(userRole == "Candidate" && request.CandidateId == userId ||
                  userRole == "Employer" && vacancy.EmployerId == userId))
            {
                return Forbid();
            }

            // Проверка: кандидат действительно откликался на эту вакансию
            var applicationExists = await _context.Applications
                .AnyAsync(a => a.VacancyId == request.VacancyId && a.CandidateId == request.CandidateId);
            if (!applicationExists) return BadRequest("Нет отклика кандидата на эту вакансию");

            var message = new Message
            {
                VacancyId = request.VacancyId,
                CandidateId = request.CandidateId,
                SenderId = userId,
                Content = request.Content,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            await _context.Entry(message).Reference(m => m.Sender).LoadAsync();

            var result = new MessageDto
            {
                Id = message.Id,
                VacancyId = message.VacancyId,
                CandidateId = message.CandidateId,
                SenderId = message.SenderId,
                SenderName = message.Sender.Name,
                Content = message.Content,
                SentAt = message.SentAt
            };

            return CreatedAtAction(nameof(GetMessages), new { vacancyId = request.VacancyId, candidateId = request.CandidateId }, result);
        }
    }
}