# FlexLiving Reviews Dashboard

A review management system for FlexLiving properties with Go backend and React frontend.

## Tech Stack

- **Backend**: Go 1.21 with Gin framework
- **Frontend**: React 18 with TypeScript
- **Styling**: Plain CSS (no framework dependencies)
- **Data Storage**: In-memory (for demo purposes)

## Features

### Manager Dashboard
- **Property Overview**: View all properties with total reviews, average ratings, and approval counts
- **Clickable Property Cards**: Navigate directly to property pages by clicking property cards
- **Review Management**: View all reviews with filtering and sorting capabilities
- **Advanced Filtering**: Filter by property name, minimum rating threshold
- **Flexible Sorting**: Sort reviews by date or rating
- **Review Approval**: Toggle approval status for public display
- **Trends Analysis**: Monitor performance trends and identify recurring issues
  - Recent performance tracking (last 30 days vs overall)
  - Category performance breakdown with color-coded indicators
  - Recurring issues detection for categories with consistent problems

### Property Display Page
- Public-facing property details page
- Shows only approved reviews
- Clean layout consistent with property listings
- Review categories with individual ratings

### API Integration
- GET `/api/reviews/hostaway` - Fetch and filter reviews
- PATCH `/api/reviews/:id/approve` - Toggle review approval
- GET `/api/properties` - Get property stats and approved reviews

## Setup Instructions

### Backend Setup
```bash
cd backend
go mod tidy
go run main.go
```
Server starts on http://localhost:8080

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend starts on http://localhost:3000

## Project Structure

### Backend Structure
```
backend/
├── main.go           # Entry point
├── models/           # Data structures
│   └── review.go
├── services/         # Business logic
│   └── review_service.go
├── handlers/         # HTTP handlers
│   └── review_handler.go
├── router/          # Route configuration
│   └── router.go
└── go.mod           # Dependencies
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx     # Manager dashboard
│   │   ├── Dashboard.css
│   │   ├── PropertyPage.tsx  # Property display page
│   │   └── PropertyPage.css
│   ├── types.ts     # TypeScript interfaces
│   ├── api.ts       # API client
│   └── App.tsx      # Main app component
└── package.json     # Dependencies
```

## Key Design Decisions

1. **Modular Architecture**: Separated into models, services, handlers, and router packages
2. **Clean Design**: Uses Flex Living color scheme 
3. **Mock Data**: Based on Hostaway API structure
4. **Review Normalization**: Converts Hostaway format to internal format
5. **Trends Analysis**: Provides performance data and identifies recurring issues

## API Behaviors

- Reviews are normalized from Hostaway format on startup
- Filtering is done server-side for better performance
- Approval status is toggled via PATCH requests
- Property stats are calculated on-demand

## Google Reviews Integration

Google Places API integration is feasible but requires:
- Google Cloud project with Places API enabled
- API key with proper restrictions
- Place ID for each property
- Rate limiting considerations (expensive API calls)

Implementation would involve:
1. Fetching reviews via Places API
2. Normalizing Google review format
3. Merging with Hostaway reviews
4. Handling different review structures

For production, recommend caching Google reviews and updating periodically rather than real-time fetching.

## Running the Application

1. Start backend: `cd backend && go run main.go`
2. Start frontend: `cd frontend && npm start`  
3. Open http://localhost:3000/dashboard
4. Use the dashboard to manage reviews
5. Click property cards to navigate to individual property pages
6. Approve reviews in dashboard to see them appear on property pages

## Testing Features

### Dashboard Functionality
- **Property Navigation**: Click any property card to view its details page
- **Review Filtering**: Search by property name or filter by minimum rating  
- **Sorting**: Toggle between date and rating sort
- **Approval Workflow**: Approve reviews → visit property page → see approved reviews appear
- **Trends Analysis**: Monitor the "Trends & Issues Analysis" section for performance insights

### API Testing
```bash
# Get all reviews with filtering
curl "http://localhost:8080/api/reviews/hostaway?property=shoreditch&sort=rating&rating=8"

# Approve a review (replace {reviewId} with actual ID)
curl -X PATCH http://localhost:8080/api/reviews/{reviewId}/approve \
  -H "Content-Type: application/json" \
  -d '{"isApproved": true}'

# Get properties with approved reviews
curl http://localhost:8080/api/properties
```