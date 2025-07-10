using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Message
    {
        public int Id { get; set; }

        [Required]
        public int VacancyId { get; set; }
        public Vacancy Vacancy { get; set; } = null!;

        [Required]
        public int CandidateId { get; set; }
        public User Candidate { get; set; } = null!;

        [Required(ErrorMessage = "Отправитель обязателен")]
        [Range(1, int.MaxValue, ErrorMessage = "Отправитель должен быть выбран")]
        public int SenderId { get; set; }
        public User Sender { get; set; } = null!;

        [Required(ErrorMessage = "Содержимое сообщения обязательно")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Сообщение должно быть от 1 до 1000 символов")]
        public string Content { get; set; } = null!;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}