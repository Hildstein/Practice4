using Backend.Models;

namespace Backend.DTO
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Resume { get; set; } = null!;
        public string About { get; set; } = null!;
        public UserRole Role { get; set; }
    }
}