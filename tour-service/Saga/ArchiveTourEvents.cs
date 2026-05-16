namespace TourService.Saga;

public record TourDetails(Guid ID);

public enum ArchiveTourCommandType : sbyte
{
    ArchiveTour = 0,
    ClearTourFromCarts = 1,
    RollbackTourArchiving = 2,
    CancelArchive = 3,
    ConfirmArchive = 4,
    UnknownCommand = 5
}

public enum ArchiveTourReplyType : sbyte
{
    TourArchived = 0,
    TourNotArchived = 1,
    ArchiveRolledBack = 2,
    ArchiveNotRolledBack = 3,
    TourFromCartsCleared = 4,
    TourFromCartsNotCleared = 5,
    ArchiveConfirmed = 6,
    UnknownReply = 11
}

public record ArchiveTourCommand(TourDetails User, ArchiveTourCommandType Type);
public record ArchiveTourReply(TourDetails User, ArchiveTourReplyType Type);