using System.ComponentModel.DataAnnotations;

namespace Backend.DTO
{
    public class CandidateRegisterRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [Phone]
        public string Phone { get; set; } = null!;

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        [StringLength(2000, MinimumLength = 50, ErrorMessage = "Резюме должно быть от 50 до 2000 символов")]
        public string Resume { get; set; } = null!;

        [Required]
        [MinLength(6, ErrorMessage = "Пароль должен быть не менее 6 символов")]
        public string Password { get; set; } = null!;
    }
}