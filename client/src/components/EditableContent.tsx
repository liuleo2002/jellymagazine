import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface EditableContentProps {
  section: string;
  contentKey: string;
  defaultValue: string;
  type?: 'text' | 'html' | 'link';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div' | 'a';
  multiline?: boolean;
}

export function EditableContent({
  section,
  contentKey,
  defaultValue,
  type = 'text',
  className = '',
  as: Component = 'div',
  multiline = false,
}: EditableContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [originalValue, setOriginalValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Only owners can edit website content
  const canEdit = user?.role === 'owner';

  useEffect(() => {
    // Fetch current content value
    const fetchContent = async () => {
      try {
        const response = await apiRequest('GET', `/api/content/${section}/${contentKey}`);
        if (response.ok) {
          const data = await response.json();
          setValue(data.value || defaultValue);
          setOriginalValue(data.value || defaultValue);
        }
      } catch (error) {
        // Use default value if content doesn't exist yet
        setValue(defaultValue);
        setOriginalValue(defaultValue);
      }
    };

    fetchContent();
  }, [section, contentKey, defaultValue]);

  const handleSave = async () => {
    if (!canEdit) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest('PUT', `/api/content/${section}/${contentKey}`, {
        value: value,
        type: type,
      });

      if (response.ok) {
        setOriginalValue(value);
        setIsEditing(false);
        toast({
          title: "Content Updated",
          description: "Your changes have been saved successfully.",
        });
      } else {
        throw new Error('Failed to save content');
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
      setValue(originalValue); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setValue(originalValue);
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  if (isEditing && canEdit) {
    return (
      <div className="relative group">
        <div className="space-y-2">
          {multiline ? (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="min-h-[100px] resize-none"
              placeholder="Enter content..."
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full"
              placeholder="Enter content..."
            />
          )}
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <Component
        className={`${className} ${canEdit ? 'cursor-pointer hover:bg-gray-100 hover:outline-2 hover:outline-dashed hover:outline-blue-300 rounded px-2 py-1 transition-all' : ''}`}
        onDoubleClick={handleDoubleClick}
        title={canEdit ? "Double-click to edit" : undefined}
      >
        {type === 'html' ? (
          <span dangerouslySetInnerHTML={{ __html: value }} />
        ) : (
          value
        )}
      </Component>
      
      {canEdit && !isEditing && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}