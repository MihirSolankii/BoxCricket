// import Admin from '../models/Admin.js';
// import BaseUser from '../models/BaseUser.js'
// import Box from '../models/BoxSchema.js';
// import mongoose from 'mongoose';
// import {SearchBoxCricketByName,getLocation} from '../utils/googleApi.js';

// const AdminProfile=async(req,res)=>{
//    const adminId=req.user.id;
//    const{
//       BankAccount,
//       IFSCode,
//        name,
//        location,
//       pricePerHour,
//        courts,
//        amenities,
//        isActive,
//        description
//    }=req.body;

//    if(!BankAccount || !IFSCode ){
//       return res.status(400).json({
//          success:false,
//          message:'BankAccount and IFSCode are required to complete your admin profile.'
//       });
//    }
//    if(pricePerHour && pricePerHour<0){
//       return res.status(400).json({
//          success:false,
//          message:'Price per hour cannot be negative.'
//       });
//    }
//    if(!courts || !amenities || !description || isActive===undefined){
//       return res.status(400).json({
//          success:false,
//          message:'Please provide all box details: courts, amenities, description, and isActive status.'
//       });
//    }
//    if(!adminId){
//       return res.status(401).json({
//          success:false,
//          message:'Unauthorized. Admin ID missing.'
//       });
//    }
//    console.log(adminId);
   
//    const session = await mongoose.startSession();
//     session.startTransaction();
//    try {
//    const admin= await Admin.findOneAndUpdate(
//       {_id:adminId,role:'admin'},
//       {
//          $set:{
//             BankAccount:BankAccount,
//             IFSCode:IFSCode,
//             adminApproved:'manually_approved'
//          }
//       },
//       {new:true,runValidators:true,session}

//    );
//    if(!admin){
//       await session.abortTransaction();
//       return res.status(404).json({message:'Admin not found. Profile completion aborted.'});
//    }
//     const placeDetails=await SearchBoxCricketByName(name,location);
//     const location=await getLocation(location);
//       if(!placeDetails){
//          await session.abortTransaction();
//          return res.status(404).json({message:'Could not fetch essential details for this Place.'});
//       }
//       console.log("placeDetails",placeDetails);
      
     
//        const newBox = new Box({
//       name: name || placeDetails.name,
//       description: description || "",
//       pricePerHour: pricePerHour || 0,
//       courts: courts || [],
//       amenities: amenities || [],

//       isActive: typeof isActive === "boolean" ? isActive : true,
//       admin: admin._id,

//       // Google-specific fields
//       googlePlaceId: placeDetails.place_id,
//       phoneno: placeDetails.phone || "",
//       mapurl: placeDetails.map_url || "",
      
//       // Proper GeoJSON location object
//       location: {
//         type: "Point",
//         coordinates: [
//           parseFloat(placeDetails.geometry?.location?.lng || location?.lng),
//           parseFloat(placeDetails.geometry?.location?.lat || location?.lat)
//         ]
//       },

//       // Address details
//       address: {
//         fullAddress: placeDetails.address|| ""
//       },

//       // Photos
//       images: (placeDetails.photos || []).map(
//         (photo) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_API_KEY}`
//       ),

//       // Operating hours
//       operatingHours: placeDetails.opening_hours
//         ? {
//             monday: { open: "08:00", close: "22:00", isClosed: false },
//             tuesday: { open: "08:00", close: "22:00", isClosed: false },
//             wednesday: { open: "08:00", close: "22:00", isClosed: false },
//             thursday: { open: "08:00", close: "22:00", isClosed: false },
//             friday: { open: "08:00", close: "22:00", isClosed: false },
//             saturday: { open: "08:00", close: "22:00", isClosed: false },
//             sunday: { open: "08:00", close: "22:00", isClosed: false },
//           }
//         : {},

//       // Ratings & Reviews
//       averageRating: placeDetails.rating || 0,
//       reviews:
//         placeDetails.reviews?.map((r) => ({
//           author_name: r.author_name,
//           rating: r.rating,
//           text: r.text,
//           time: new Date(r.time * 1000).toISOString(),
//           profile_photo_url: r.profile_photo_url,
//         })) || [],
//     });

      
//    } catch (error) {
//       res.status(500).json({
//          success:false,
//          message:'Server error during admin profile completion.',
//          error:error.message
//       });  
//    }

//     const savedBox = await newBox.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       success: true,
//       message: 'Box Owner profile and first Box listing completed successfully. Ready for bookings!',
//       box: savedBox,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     return res.status(500).json({
//       success: false,
//       message: 'Server error during admin profile completion.',
//       error: error.message,
//     });
  


    
// }
// export default AdminProfile;

import Admin from '../models/Admin.js';
import BaseUser from '../models/BaseUser.js';
import Box from '../models/BoxSchema.js';
import mongoose from 'mongoose';
import { SearchBoxCricketByName, getLocation } from '../utils/googleApi.js';

const AdminProfile = async (req, res) => {
  const adminId = req.user?.id;

  const {
    BankAccount,
    IFSCode,
    name,
    location,
    pricePerHour,
    courts,
    amenities,
    isActive,
    description,
  } = req.body;

  // Basic validations
  if (!BankAccount || !IFSCode) {
    return res.status(400).json({
      success: false,
      message: 'BankAccount and IFSCode are required to complete your admin profile.',
    });
  }

  if (pricePerHour && pricePerHour < 0) {
    return res.status(400).json({
      success: false,
      message: 'Price per hour cannot be negative.',
    });
  }

  if (!courts || !amenities || !description || isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all box details: courts, amenities, description, and isActive status.',
    });
  }

  if (!adminId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Admin ID missing.',
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
  
    const admin = await Admin.findOneAndUpdate(
      { _id: adminId, role: 'admin' },
      {
        $set: {
          BankAccount,
          IFSCode,
          adminApproved: 'approved', 
        },
      },
      { new: true, runValidators: true, session }
    );

    if (!admin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Admin not found. Profile completion aborted.',
      });
    }

    
    const placeDetails = await SearchBoxCricketByName(name, location);
    console.log(placeDetails);
    
    const geoLocation = await getLocation(location);
    console.log("geoLocation",geoLocation);

    if (!placeDetails) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Could not fetch essential details for this Place.',
      });
    }
const place_id="oiewnfgowenf"
  
    const newBox = new Box({
      name: name || placeDetails.name,
      
      description: description || '',
      pricePerHour: pricePerHour || 0,
      courts: courts || [],
      amenities:   amenities || [],
      isActive: typeof isActive === 'boolean' ? isActive : true,
      admin: admin._id,
      googlePlaceId: place_id,
      phoneno: placeDetails.phone || '',
      mapurl: placeDetails.map_url || '',

      location: {
        type: 'Point',
        coordinates: [
          parseFloat(placeDetails.geometry?.location?.lng || geoLocation?.lng || 0),
          parseFloat(placeDetails.geometry?.location?.lat || geoLocation?.lat || 0),
        ],
      },

      address: {
        fullAddress: placeDetails.address || '',
      },

      images:Array.isArray(placeDetails.photos) ? placeDetails.photos : [],

      operatingHours:
        placeDetails.opening_hours || {},

      averageRating: placeDetails.rating || 0,
      reviews:
        placeDetails.reviews?.map((r) => ({
          author_name: r.author_name,
          rating: r.rating,
          text: r.text,
          time: new Date(r.time * 1000).toISOString(),
          profile_photo_url: r.profile_photo_url,
        })) || [],
    });

    const savedBox = await newBox.save({ session });

  
    admin.boxSchemas.push(savedBox._id);
await admin.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: 'Box Owner profile and first Box listing completed successfully.',
      box: savedBox,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('AdminProfile Error:', error);

 
    return res.status(500).json({
      success: false,
      message: 'Server error during admin profile completion.',
      error: error.message,
    });
  }
};

export default AdminProfile;
