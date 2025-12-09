import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

const filterGroups: FilterGroup[] = [
  {
    id: 'notes',
    label: 'Fragrance Notes',
    options: [
      { id: 'top', label: 'Top Notes' },
      { id: 'middle', label: 'Middle Notes' },
      { id: 'base', label: 'Base Notes' },
    ],
  },
  {
    id: 'family',
    label: 'Fragrance Family',
    options: [
      { id: 'citrus', label: 'Citrus' },
      { id: 'floral', label: 'Floral' },
      { id: 'woody', label: 'Woody' },
      { id: 'oriental', label: 'Oriental' },
      { id: 'fresh', label: 'Fresh' },
      { id: 'spicy', label: 'Spicy' },
    ],
  },
  {
    id: 'longevity',
    label: 'Longevity',
    options: [
      { id: 'light', label: 'Light (2-4 hours)' },
      { id: 'moderate', label: 'Moderate (4-6 hours)' },
      { id: 'long', label: 'Long (6-8 hours)' },
      { id: 'very-long', label: 'Very Long (8+ hours)' },
    ],
  },
  {
    id: 'occasion',
    label: 'Occasion',
    options: [
      { id: 'daily', label: 'Daily Wear' },
      { id: 'party', label: 'Party' },
      { id: 'date', label: 'Date Night' },
      { id: 'office', label: 'Office' },
      { id: 'casual', label: 'Casual' },
      { id: 'formal', label: 'Formal Events' },
    ],
  },
];

interface ProductFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFilters: Record<string, string[]>;
  onFilterChange: (groupId: string, optionId: string) => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  isOpen,
  onClose,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    filterGroups.map((g) => g.id)
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const totalFilters = Object.values(selectedFilters).flat().length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 overflow-y-auto lg:relative lg:h-auto lg:w-full lg:bg-transparent lg:border-none"
          >
            <div className="p-6 lg:p-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 lg:mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold">Filters</h3>
                  {totalFilters > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {totalFilters}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="lg:hidden"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {totalFilters > 0 && (
                <Button
                  variant="link"
                  className="text-primary p-0 h-auto mb-4"
                  onClick={onClearFilters}
                >
                  Clear all filters
                </Button>
              )}

              {/* Filter Groups */}
              <div className="space-y-4">
                {filterGroups.map((group) => (
                  <div
                    key={group.id}
                    className="border border-border/50 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <span className="font-medium">{group.label}</span>
                      {expandedGroups.includes(group.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedGroups.includes(group.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-3">
                            {group.options.map((option) => (
                              <label
                                key={option.id}
                                className="flex items-center gap-3 cursor-pointer group"
                              >
                                <Checkbox
                                  checked={selectedFilters[group.id]?.includes(
                                    option.id
                                  )}
                                  onCheckedChange={() =>
                                    onFilterChange(group.id, option.id)
                                  }
                                />
                                <span className="text-sm group-hover:text-primary transition-colors">
                                  {option.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
