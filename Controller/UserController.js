import BaseUser from '../models/BaseUser.js';
import Admin from '../models/Admin.js';
import Box from '../models/BoxSchema.js';
import User from '../models/User.js';

export const getallboxes = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!Array.isArray(user.location.coordinates) || user.location.coordinates.length < 2) {
            return res.status(400).json({
                success: false,
                message: "User coordinates not found or incomplete"
            });
        }

        const [lng, lat] = user.location.coordinates;
        console.log("user coordinates", lat, lng);
const [userLng, userLat] = user.location.coordinates;
console.log(userLng,userLat);


 const boxes = await Box.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)] // [lng, lat]
          },
          $maxDistance: 5000 // 5 km radius
        }
      }
    });
  
      

        return res.status(200).json({
            success: true,
            boxes
        });

    } catch (error) {
        console.log("getallboxes error:", error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching boxes',
            error: error.message
        });
    }
}
