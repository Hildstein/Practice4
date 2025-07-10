namespace Backend.DTO
{
    public class VacancyDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string City { get; set; } = null!;
        public int EmployerId { get; set; }
        public string EmployerName { get; set; } = null!;
        public string EmployerEmail { get; set; } = null!;
        public string EmployerPhone { get; set; } = null!;
    }
}