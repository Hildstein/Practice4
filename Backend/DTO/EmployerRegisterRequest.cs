using System.ComponentModel.DataAnnotations;

namespace Backend.DTO
{
    public class EmployerRegisterRequest
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
        [MinLength(6, ErrorMessage = "Пароль должен быть не менее 6 символов")]
        public string Password { get; set; } = null!;

        [Required]
        [StringLength(2000, MinimumLength = 10, ErrorMessage = "Описание компании должно быть от 10 до 2000 символов")]
        public string About { get; set; } = null!;
    }
}