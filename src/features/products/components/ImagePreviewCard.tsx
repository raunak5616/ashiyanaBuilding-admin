import React from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface ImagePreviewCardProps {
  url: string;
  altText?: string;
  index: number;
  onRemove: (index: number) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
}

export const ImagePreviewCard: React.FC<ImagePreviewCardProps> = ({
  url,
  altText = 'Product Image',
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, index)}
      className="relative w-28 h-28 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center group cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all duration-200 select-none"
    >
      {/* Image element with object-fit contain */}
      <img
        src={url}
        alt={altText}
        className="w-full h-full object-contain p-1"
        draggable={false} // Prevents default browser image drag behavior
      />

      {/* Drag handle indicator overlay */}
      <div className="absolute top-1 left-1 bg-white/80 backdrop-blur-xs rounded-md p-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
        <DragIndicatorIcon className="h-3.5 w-3.5 text-slate-500" />
      </div>

      {/* Action overlay (Remove button) */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          size="small"
          className="!bg-white !text-rose-600 hover:!bg-rose-50"
        >
          <DeleteIcon className="h-4 w-4" />
        </IconButton>
      </div>

      {/* Badge indicating ordering */}
      <div className="absolute bottom-1 right-1 bg-secondary/80 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
        {index + 1}
      </div>
    </div>
  );
};

export default ImagePreviewCard;
