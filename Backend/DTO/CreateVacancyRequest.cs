using System.ComponentModel.DataAnnotations;

namespace Backend.DTO
{
    public class CreateVacancyRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 5)]
        public string Title { get; set; } = null!;

        [Required]
        [StringLength(2000, MinimumLength = 20)]
        public string Description { get; set; } = null!;

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string City { get; set; } = null!;

        // Employer определяется автоматически по текущему пользователю
    }
}