using System.ComponentModel.DataAnnotations;

namespace Backend.DTO
{
    public class CreateApplicationRequest
    {
        [Required]
        public int VacancyId { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string VacancyTitle { get; set; } = null!;

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string CandidateName { get; set; } = null!;
    }
}