/**
 * frappe.views.MapView
 */
frappe.provide('frappe.utils.utils');
frappe.provide("frappe.views");

frappe.views.MapView = class MapView extends frappe.views.ListView {
	get view_name() {
		return 'Map';
	}

	setup_defaults() {
		super.setup_defaults();
		this.page_title = __('{0} Map', [this.page_title]);
	}

	setup_view() {
	}

	on_filter_change() {
		this.get_coords();
	}

	render() {
		this.get_coords()
			.then(() => {
				this.render_map_view();
			});
		this.$paging_area.find('.level-left').append('<div></div>');
	}

	render_map_view() {
		
		this.map_id = frappe.dom.get_unique_id();

		this.$result.html(`<div id="${this.map_id}" class="map-view-container"></div>`);

		L.Icon.Default.imagePath = '/assets/frappe/images/leaflet/';
		this.map = L.map(this.map_id).setView(frappe.utils.map_defaults.center,
			frappe.utils.map_defaults.zoom);

		// L.tileLayer(frappe.utils.map_defaults.tiles,
		// 	frappe.utils.map_defaults.options).addTo(this.map);

		//custom code ersi
		const apiKey = "AAPKbfebb9d0816d476cab949ed829aef83cQ3uXWwUfQSTtFkaYHH4zDVqXMM1njaqpiM8DNqLjFTsWCtO8qtbD-QgvRZb1B6U-";
		const token = this.coords.token
		L.esri.Vector.vectorBasemapLayer("ArcGIS:Streets", {
			apikey: apiKey
		}).addTo(this.map);

		L.esri
        .featureLayer({
          url: "https://geomed.amana-md.gov.sa/arcgis/rest/services/AppVisualDistortion/VisualDistortion/MapServer/0?token="+token,
		  color:"black",
		  opacity: 0.65,
		weight: 2
        })
        .addTo(this.map);
	
		L.esri
        .featureLayer({
          url: "https://geomed.amana-md.gov.sa/arcgis/rest/services/AppVisualDistortion/VisualDistortion/MapServer/1?token="+token,
		  color:"red",
		  opacity: 0.65,
		weight: 2
        })
        .addTo(this.map);
		//custom code end for esri
		
		L.control.scale().addTo(this.map);
		if (this.coords.features && this.coords.features.length) {	
			//custom code start here
			if(this.coords.parent_doc && this.coords.parent_doc == "Task"){
				this.coords.features.forEach(
					coords => coords.properties.child_feature?"":L.geoJSON(coords,{color: coords.properties.color}).bindPopup(coords.properties.display_name+"<br>"+coords.properties.project_name+"<br>"+coords.properties.task_phase).addTo(this.map)
				);
			}else{
				this.coords.features.forEach(
					coords => L.geoJSON(coords).bindPopup(coords.properties.name).addTo(this.map)
				);
			}
			//custom code end here below commented code is orignal code.
			// this.coords.features.forEach(
			// 	coords => L.geoJSON(coords).bindPopup(coords.properties.name).addTo(this.map)
			// );
			let lastCoords = this.coords.features[0].geometry.coordinates.reverse();
			this.map.panTo(lastCoords, 8);
		}

		
	}

	//orignal code
	// get_coords() {
	// 	let get_coords_method = this.settings && this.settings.get_coords_method || 'frappe.geo.utils.get_coords';

	// 	if (cur_list.meta.fields.find(i => i.fieldname === 'location' && i.fieldtype === 'Geolocation')) {
	// 		this.type = 'location_field';
	// 	} else if  (cur_list.meta.fields.find(i => i.fieldname === "latitude") &&
	// 		cur_list.meta.fields.find(i => i.fieldname === "longitude")) {
	// 		this.type = 'coordinates';
	// 	}
	// 	return frappe.call({
	// 		method: get_coords_method,
	// 		args: {
	// 			doctype: this.doctype,
	// 			filters: cur_list.filter_area.get(),
	// 			type: this.type
	// 		}
	// 	}).then(r => {
	// 		this.coords = r.message;

	// 	});
	// }

	//custom code
	get_coords() {
		let get_coords_method = this.settings && this.settings.get_coords_method || 'frappe.geo.utils.get_coords';

		if (cur_list.meta.fields.find(i => i.fieldname === 'location' && i.fieldtype === 'Geolocation')) {
			this.type = 'location_field';
		} else if  (cur_list.meta.fields.find(i => i.fieldname === "latitude") &&
			cur_list.meta.fields.find(i => i.fieldname === "longitude")) {
			this.type = 'coordinates';
		}
		if(this.doctype == "Task"){
			return frappe.call({
				method: 'foxerp_madinah.api.project.get_coords',
				args: {
					doctype: "Locations",
					filters: cur_list.filter_area.get(),
					type: this.type,
					parent: "Task"
				}
			}).then(r => {
				this.coords = r.message;
	
			});
		}else{
			return frappe.call({
				method: get_coords_method,
				args: {
					doctype: this.doctype,
					filters: cur_list.filter_area.get(),
					type: this.type
				}
			}).then(r => {
				this.coords = r.message;
			});
		}
		
	}
	get required_libs() {
		return [
			"assets/frappe/js/lib/leaflet/leaflet.css",
			"assets/frappe/js/lib/leaflet/leaflet.js",
			"assets/frappe/js/lib/leaflet/esri-leaflet.js",
			"assets/frappe/js/lib/leaflet/esri-leaflet-vector.js"
		];
	}
};
