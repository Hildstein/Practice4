using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class FixingModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Applications_ApplicationId",
                table: "Messages");

            migrationBuilder.RenameColumn(
                name: "ApplicationId",
                table: "Messages",
                newName: "VacancyId");

            migrationBuilder.RenameIndex(
                name: "IX_Messages_ApplicationId",
                table: "Messages",
                newName: "IX_Messages_VacancyId");

            migrationBuilder.AddColumn<int>(
                name: "CandidateId",
                table: "Messages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_CandidateId",
                table: "Messages",
                column: "CandidateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Users_CandidateId",
                table: "Messages",
                column: "CandidateId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Vacancies_VacancyId",
                table: "Messages",
                column: "VacancyId",
                principalTable: "Vacancies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Users_CandidateId",
                table: "Messages");

            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Vacancies_VacancyId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_CandidateId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "CandidateId",
                table: "Messages");

            migrationBuilder.RenameColumn(
                name: "VacancyId",
                table: "Messages",
                newName: "ApplicationId");

            migrationBuilder.RenameIndex(
                name: "IX_Messages_VacancyId",
                table: "Messages",
                newName: "IX_Messages_ApplicationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Applications_ApplicationId",
                table: "Messages",
                column: "ApplicationId",
                principalTable: "Applications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
