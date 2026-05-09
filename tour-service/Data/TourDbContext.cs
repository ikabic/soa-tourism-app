using Microsoft.EntityFrameworkCore;
using TourService.Models;

namespace TourService.Data;

public class TourDbContext(DbContextOptions<TourDbContext> options) : DbContext(options)
{
    public DbSet<Tour> Tours => Set<Tour>();
    public DbSet<KeyPoint> KeyPoints => Set<KeyPoint>();
    public DbSet<TourDuration> TourDurations => Set<TourDuration>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Tour>()
            .Property(t => t.Tags)
            .HasColumnType("text[]");

        modelBuilder.Entity<Tour>()
            .Property(t => t.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Tour>()
            .Property(t => t.Difficulty)
            .HasConversion<string>();

        modelBuilder.Entity<TourDuration>()
            .Property(d => d.TransportType)
            .HasConversion<string>();

        modelBuilder.Entity<KeyPoint>()
            .HasOne(k => k.Tour)
            .WithMany(t => t.KeyPoints)
            .HasForeignKey(k => k.TourId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TourDuration>()
            .HasOne(d => d.Tour)
            .WithMany(t => t.Durations)
            .HasForeignKey(d => d.TourId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
