using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTO
{
    public class RegisterRequest
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
        public string Resume { get; set; } = null!;

        [Required]
        [MinLength(6, ErrorMessage = "Пароль должен быть не менее 6 символов")]
        public string Password { get; set; } = null!;

        [Required]
        public UserRole Role { get; set; }
    }
}