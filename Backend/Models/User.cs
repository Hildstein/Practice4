using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    [Index(nameof(Email), IsUnique = true)]
    [Index(nameof(Phone), IsUnique = true)]
    public class User
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "Введите корректный email")]
        [StringLength(100)]
        public string Email { get; set; } = null!;

        [Required]
        [Phone(ErrorMessage = "Введите корректный телефон")]
        [StringLength(20)]
        public string Phone { get; set; } = null!;

        [Required]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Имя должно быть от 2 до 100 символов")]
        public string Name { get; set; } = null!;

        [StringLength(2000, MinimumLength = 50, ErrorMessage = "Резюме должно быть от 50 до 2000 символов")]
        public string? Resume { get; set; }

        [Required]
        [MinLength(6, ErrorMessage = "Пароль должен быть не менее 6 символов")]
        [MaxLength(64, ErrorMessage = "Пароль слишком длинный")]
        public string PasswordHash { get; set; } = null!;

        [Required]
        public UserRole Role { get; set; }
    }
}
