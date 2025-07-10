using Backend.Models;

namespace Backend.DTO
{
    public class PublicUserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? About { get; set; }
        public string? Resume { get; set; }
        public UserRole Role { get; set; }
    }
}