using Backend.Models;

namespace Backend.DTO
{
    public class ApplicationDto
    {
        public int Id { get; set; }
        public int VacancyId { get; set; }
        public string VacancyTitle { get; set; } = null!;
        public int CandidateId { get; set; }
        public string CandidateName { get; set; } = null!;
        public string? CandidateResume { get; set; }
        public DateTime AppliedAt { get; set; }
        public ApplicationStatus Status { get; set; }
    }
}