namespace Backend.DTO
{
    public class MessageDto
    {
        public int Id { get; set; }
        public int VacancyId { get; set; }
        public int CandidateId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime SentAt { get; set; }
    }

    public class CreateMessageRequest
    {
        public int VacancyId { get; set; }
        public int CandidateId { get; set; }
        public string Content { get; set; } = null!;
    }
}