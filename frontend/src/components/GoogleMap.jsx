import { useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

"use client";




export const GoogleMap = () => {
    const position = { lat: 50.4614345, lng: 30.4280238 };
    const [open, setOpen] = useState(false);
    
    return (
        <APIProvider apiKey="AIzaSyB0qGEMe1pLOd0Hhj7FAb-WWhgg_wqWvTg">
            <div style={{ height: "75vh", width: "50%" }}>
                <Map defaultZoom={9} defaultCenter={position} mapId="e2aa2390b32c03be6cb9961d">
                    <AdvancedMarker position={position} onClick={() => setOpen(true)}>
                        <Pin
                        />
                    </AdvancedMarker>

                    {open && (
                    <InfoWindow position={position} onCloseClick={() => setOpen(false)}>
                        <p>KROK University<br/>Tabirna St, 30-32, Kyiv, Ukraine, 03113</p>
                    </InfoWindow>
                    )}
                </Map>
            </div>

        </APIProvider>

        
    );
};
