using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Vacancy
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Название вакансии обязательно")]
        [StringLength(100, MinimumLength = 5, ErrorMessage = "Название должно быть от 5 до 100 символов")]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Описание обязательно")]
        [StringLength(2000, MinimumLength = 20, ErrorMessage = "Описание должно быть от 20 до 2000 символов")]
        public string Description { get; set; } = null!;

        [Required(ErrorMessage = "Город обязателен")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Город должен быть от 2 до 100 символов")]
        public string City { get; set; } = null!;

        public int EmployerId { get; set; }

        public User Employer { get; set; } = null!;
    }
}
