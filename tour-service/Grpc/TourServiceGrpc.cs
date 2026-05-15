using Grpc.Core;
using TourService.Models.Enums;
using TourService.Repositories;
using TourService.Grpc;

namespace TourService.Grpc;

public class TourServiceGrpc : TourService.TourServiceBase
{
    private readonly ITourRepository tourRepository;

    public TourServiceGrpc(ITourRepository tourRepository)
    {
        this.tourRepository = tourRepository;
    }

    public override async Task<GetTourPublicInfoResponse> GetTourPublicInfo(GetTourPublicInfoRequest request, ServerCallContext context)
    {
        var tour = await tourRepository.GetByIdAsync(Guid.Parse(request.TourId));
        if (tour == null)
        {
            throw new RpcException(new Status(StatusCode.NotFound, "Tour not found"));
        }

        return new GetTourPublicInfoResponse
        {
            TourId = tour.Id.ToString(),
            Name = tour.Name,
            Description = tour.Description,
            Price = (double)tour.Price
        };
    }

    public override async Task<IsTourPublishedResponse> IsTourPublished(IsTourPublishedRequest request, ServerCallContext context)
    {
        var tour = await tourRepository.GetByIdAsync(Guid.Parse(request.TourId));
        if (tour == null)
        {
            throw new RpcException(new Status(StatusCode.NotFound, "Tour not found"));
        }

        return new IsTourPublishedResponse
        {
            IsPublished = tour.Status == TourStatus.Published
        };
    }
}
