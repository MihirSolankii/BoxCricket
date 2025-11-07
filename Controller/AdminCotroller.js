import Admin from '../models/Admin.js';
import BaseUser from '../models/BaseUser.js';
import Box from '../models/BoxSchema.js';

import mongoose from 'mongoose';

export const updateBoxDetails=async(req,res)=>{
    const adminId= req.user.id;
    const boxId =req.params.boxId;

     const {
    name,
    description,
    pricePerHour,
    courts,
    amenities,
    images,
    isActive
  } = req.body;

    if (!mongoose.Types.ObjectId.isValid(boxId)) {
    return res.status(400).json({ success: false, message: 'Invalid Box ID' });
  }
  try {
    const box=await Box.findOne({ _id: boxId, admin: adminId });
    if(!box){
        return res.status(404).json({ success: false, message: 'Box not found or access denied' });
    }

    // Update fields if they are provided in the request body
     if (name) box.name = name;
    if (description) box.description = description;
    if (pricePerHour !== undefined) box.pricePerHour = pricePerHour;
    if (courts) box.courts = courts;
    if (amenities) box.amenities = amenities;
    if (images) box.images = images;
    if (isActive !== undefined) box.isActive = isActive;
     box.updatedAt = new Date();

     const updatedBox = await box.save();
     return res.status(200).json({ success: true, message: 'Box details updated successfully', box: updatedBox });
    
  } catch (error) {
     console.error('updateBoxDetails error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
export const updateCourtAvailability=async(req,res)=>{
    const adminId= req.user.id;
    const boxId =req.params.boxId;
    const {  courtNumber, isAvailable } = req.body;

  if (!mongoose.Types.ObjectId.isValid(boxId)) {
    return res.status(400).json({ success: false, message: 'Invalid Box ID' });
  }
  try {
    
    const box=await Box.findOne({ _id: boxId, admin: adminId });
    if(!box){
        return res.status(404).json({ success: false, message: 'Box not found or access denied' });
    }
    const court=box.courts.find(courts=>courts.courtNumber===courtNumber);
    if(!court){
        return res.status(404).json({ success: false, message: 'Court not found' });
    }
    court.isAvailable=isAvailable;
    box.updatedAt = new Date();
    const updatedBox = await box.save();
     return res.status(200).json({ success: true, message: 'Court availability updated successfully', box: updatedBox });

  } catch (error) {
       console.error('updateBoxDetails error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }

}

export const updateOperatingHours=async(req,res)=>{
    const adminId= req.user.id;
    const boxId =req.params.boxId;
    const operatingHours = req.body.operatingHours;
    if (!mongoose.Types.ObjectId.isValid(boxId)) {
    return res.status(400).json({ success: false, message: 'Invalid Box ID' });
  }
  try {
    const Box=await Box.findOne({_id:BoxId,admin:adminId});
    if(!Box){
        return res.status(404).json({ success: false, message: 'Box not found or access denied' });
    }
    Box.operatingHours = operatingHours;
    Box.updatedAt = new Date();
    const updatedBox = await Box.save();
     return res.status(200).json({ success: true, message: 'Operating hours updated successfully', box: updatedBox });
  } catch (error) {
      console.error('updateBoxDetails error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}

export const DeleteBox =async(req,res)=>{
    const adminId= req.user.id;
    const boxId =req.params.boxId;
    if (!mongoose.Types.ObjectId.isValid(boxId)) {
    return res.status(400).json({ success: false, message: 'Invalid Box ID' });
  }
  try {
    const box=await Box.findOneAndDelete({ _id: boxId, admin: adminId });
    if(!box){
        return res.status(404).json({ success: false, message: 'Box not found or access denied' });
    }
    await Admin.findByIdAndUpdate(adminId, { $pull: { boxes: boxId } });
    return res.status(200).json({ success: true, message: 'Box deleted successfully' });

  } catch (error) {
    console.error('deleteBox error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
