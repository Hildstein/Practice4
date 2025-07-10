using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.Models
{
    public class Application
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Вакансия обязательна")]
        [Range(1, int.MaxValue, ErrorMessage = "Вакансия должна быть выбрана")]
        public int VacancyId { get; set; }

        public Vacancy Vacancy { get; set; } = null!;

        [Required(ErrorMessage = "Кандидат обязателен")]
        [Range(1, int.MaxValue, ErrorMessage = "Кандидат должен быть выбран")]
        public int CandidateId { get; set; }

        public User Candidate { get; set; } = null!;

        // AppliedAt обычно выставляется сервером
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public ApplicationStatus Status { get; set; } = ApplicationStatus.New;
    }
}
