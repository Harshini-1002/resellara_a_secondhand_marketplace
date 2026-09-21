package com.sellara.controller;

import com.sellara.dto.common.ApiResponse;
import com.sellara.dto.location.IndianLocation;
import com.sellara.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<IndianLocation>>> searchLocations(@RequestParam(required = false) String query) {
        List<IndianLocation> results = locationService.searchLocations(query);
        return ResponseEntity.ok(ApiResponse.success("Locations retrieved", results));
    }

    @GetMapping("/states")
    public ResponseEntity<ApiResponse<List<String>>> getStates() {
        return ResponseEntity.ok(ApiResponse.success("Indian States retrieved", locationService.getAllStates()));
    }
}