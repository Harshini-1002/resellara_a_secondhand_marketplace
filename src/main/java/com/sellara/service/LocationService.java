package com.sellara.service;

import com.sellara.dto.location.IndianLocation;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final List<IndianLocation> locations = new ArrayList<>();
    private final List<String> states = new ArrayList<>();

    public LocationService() {
        initLocations();
    }

    public List<IndianLocation> searchLocations(String query) {
        if (query == null || query.trim().length() < 2) {
            return locations.stream().limit(10).collect(Collectors.toList());
        }
        String q = query.trim().toLowerCase();

        return locations.stream()
            .filter(loc ->
                loc.getCity().toLowerCase().contains(q) ||
                loc.getDistrict().toLowerCase().contains(q) ||
                loc.getState().toLowerCase().contains(q) ||
                (loc.getPinCode() != null && loc.getPinCode().contains(q))
            )
            .limit(15)
            .collect(Collectors.toList());
    }

    public List<String> getAllStates() {
        return states;
    }

    private void initLocations() {
        // States & Union Territories
        states.addAll(Arrays.asList(
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
            "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
            "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
            "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
            "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
            "Delhi NCR", "Chandigarh", "Jammu and Kashmir", "Ladakh", "Puducherry"
        ));
        Collections.sort(states);

        // Curated Comprehensive Indian Location Records (City, District, State, PIN)
        addLoc("Hyderabad", "Hyderabad", "Telangana", "500001");
        addLoc("Secunderabad", "Hyderabad", "Telangana", "500003");
        addLoc("Gachibowli", "Rangareddy", "Telangana", "500032");
        addLoc("HITEC City", "Rangareddy", "Telangana", "500081");
        addLoc("Warangal", "Hanamkonda", "Telangana", "506001");
        addLoc("Nizamabad", "Nizamabad", "Telangana", "503001");
        addLoc("Karimnagar", "Karimnagar", "Telangana", "505001");
        addLoc("Khammam", "Khammam", "Telangana", "507001");

        addLoc("Bengaluru", "Bengaluru Urban", "Karnataka", "560001");
        addLoc("Indiranagar", "Bengaluru Urban", "Karnataka", "560038");
        addLoc("Koramangala", "Bengaluru Urban", "Karnataka", "560034");
        addLoc("Whitefield", "Bengaluru Urban", "Karnataka", "560066");
        addLoc("Mysuru", "Mysuru", "Karnataka", "570001");
        addLoc("Mangaluru", "Dakshina Kannada", "Karnataka", "575001");
        addLoc("Hubballi", "Dharwad", "Karnataka", "580020");
        addLoc("Belagavi", "Belagavi", "Karnataka", "590001");

        addLoc("Mumbai", "Mumbai City", "Maharashtra", "400001");
        addLoc("Bandra", "Mumbai Suburban", "Maharashtra", "400050");
        addLoc("Andheri", "Mumbai Suburban", "Maharashtra", "400058");
        addLoc("Thane", "Thane", "Maharashtra", "400601");
        addLoc("Navi Mumbai", "Thane", "Maharashtra", "400703");
        addLoc("Pune", "Pune", "Maharashtra", "411001");
        addLoc("Kothrud", "Pune", "Maharashtra", "411038");
        addLoc("Hinjawadi", "Pune", "Maharashtra", "411057");
        addLoc("Nagpur", "Nagpur", "Maharashtra", "440001");
        addLoc("Nashik", "Nashik", "Maharashtra", "422001");
        addLoc("Aurangabad (Chhatrapati Sambhajinagar)", "Aurangabad", "Maharashtra", "431001");

        addLoc("New Delhi", "Central Delhi", "Delhi NCR", "110001");
        addLoc("Connaught Place", "New Delhi", "Delhi NCR", "110001");
        addLoc("South Extension", "South Delhi", "Delhi NCR", "110049");
        addLoc("Dwarka", "South West Delhi", "Delhi NCR", "110075");
        addLoc("Noida", "Gautam Buddha Nagar", "Uttar Pradesh", "201301");
        addLoc("Greater Noida", "Gautam Buddha Nagar", "Uttar Pradesh", "201310");
        addLoc("Gurugram", "Gurugram", "Haryana", "122001");
        addLoc("DLF Phase 5", "Gurugram", "Haryana", "122009");
        addLoc("Faridabad", "Faridabad", "Haryana", "121001");
        addLoc("Ghaziabad", "Ghaziabad", "Uttar Pradesh", "201001");

        addLoc("Chennai", "Chennai", "Tamil Nadu", "600001");
        addLoc("T. Nagar", "Chennai", "Tamil Nadu", "600017");
        addLoc("Adyar", "Chennai", "Tamil Nadu", "600020");
        addLoc("Coimbatore", "Coimbatore", "Tamil Nadu", "641001");
        addLoc("Madurai", "Madurai", "Tamil Nadu", "625001");
        addLoc("Tiruchirappalli", "Tiruchirappalli", "Tamil Nadu", "620001");
        addLoc("Salem", "Salem", "Tamil Nadu", "636001");

        addLoc("Kolkata", "Kolkata", "West Bengal", "700001");
        addLoc("Salt Lake City", "North 24 Parganas", "West Bengal", "700091");
        addLoc("New Town", "North 24 Parganas", "West Bengal", "700156");
        addLoc("Howrah", "Howrah", "West Bengal", "711101");
        addLoc("Siliguri", "Darjeeling", "West Bengal", "734001");

        addLoc("Ahmedabad", "Ahmedabad", "Gujarat", "380001");
        addLoc("Satellite", "Ahmedabad", "Gujarat", "380015");
        addLoc("Surat", "Surat", "Gujarat", "395001");
        addLoc("Vadodara", "Vadodara", "Gujarat", "390001");
        addLoc("Rajkot", "Rajkot", "Gujarat", "360001");
        addLoc("Gandhinagar", "Gandhinagar", "Gujarat", "382010");

        addLoc("Jaipur", "Jaipur", "Rajasthan", "302001");
        addLoc("Jodhpur", "Jodhpur", "Rajasthan", "342001");
        addLoc("Udaipur", "Udaipur", "Rajasthan", "313001");
        addLoc("Kota", "Kota", "Rajasthan", "324001");

        addLoc("Lucknow", "Lucknow", "Uttar Pradesh", "226001");
        addLoc("Gomti Nagar", "Lucknow", "Uttar Pradesh", "226010");
        addLoc("Kanpur", "Kanpur Nagar", "Uttar Pradesh", "208001");
        addLoc("Varanasi", "Varanasi", "Uttar Pradesh", "221001");
        addLoc("Agra", "Agra", "Uttar Pradesh", "282001");
        addLoc("Prayagraj", "Prayagraj", "Uttar Pradesh", "211001");
        addLoc("Meerut", "Meerut", "Uttar Pradesh", "250001");

        addLoc("Chandigarh", "Chandigarh", "Chandigarh", "160017");
        addLoc("Ludhiana", "Ludhiana", "Punjab", "141001");
        addLoc("Amritsar", "Amritsar", "Punjab", "143001");
        addLoc("Jalandhar", "Jalandhar", "Punjab", "144001");

        addLoc("Kochi", "Ernakulam", "Kerala", "682001");
        addLoc("Kakkarand", "Ernakulam", "Kerala", "682030");
        addLoc("Thiruvananthapuram", "Thiruvananthapuram", "Kerala", "695001");
        addLoc("Kozhikode", "Kozhikode", "Kerala", "673001");
        addLoc("Thrissur", "Thrissur", "Kerala", "680001");

        addLoc("Indore", "Indore", "Madhya Pradesh", "452001");
        addLoc("Bhopal", "Bhopal", "Madhya Pradesh", "462001");
        addLoc("Gwalior", "Gwalior", "Madhya Pradesh", "474001");
        addLoc("Jabalpur", "Jabalpur", "Madhya Pradesh", "482001");

        addLoc("Patna", "Patna", "Bihar", "800001");
        addLoc("Gaya", "Gaya", "Bihar", "823001");
        addLoc("Bhubaneswar", "Khordha", "Odisha", "751001");
        addLoc("Cuttack", "Cuttack", "Odisha", "753001");

        addLoc("Visakhapatnam", "Visakhapatnam", "Andhra Pradesh", "530001");
        addLoc("Vijayawada", "NTR (Krishna)", "Andhra Pradesh", "520001");
        addLoc("Guntur", "Guntur", "Andhra Pradesh", "522001");
        addLoc("Tirupati", "Tirupati", "Andhra Pradesh", "517501");

        addLoc("Dehradun", "Dehradun", "Uttarakhand", "248001");
        addLoc("Haridwar", "Haridwar", "Uttarakhand", "249401");
        addLoc("Raipur", "Raipur", "Chhattisgarh", "492001");
        addLoc("Ranchi", "Ranchi", "Jharkhand", "834001");
        addLoc("Jamshedpur", "East Singhbhum", "Jharkhand", "831001");
        addLoc("Guwahati", "Kamrup Metropolitan", "Assam", "781001");
        addLoc("Panaji", "North Goa", "Goa", "403001");
        addLoc("Margao", "South Goa", "Goa", "403601");
        addLoc("Shimla", "Shimla", "Himachal Pradesh", "171001");
        addLoc("Srinagar", "Srinagar", "Jammu and Kashmir", "190001");
        addLoc("Jammu", "Jammu", "Jammu and Kashmir", "180001");
    }

    private void addLoc(String city, String district, String state, String pinCode) {
        locations.add(new IndianLocation(city, district, state, pinCode));
    }
}