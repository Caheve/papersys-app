using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PaperSys.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPrecioMayorista : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PrecioMayorista",
                table: "Productos",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrecioMayorista",
                table: "Productos");
        }
    }
}
