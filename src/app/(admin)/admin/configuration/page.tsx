'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IMEInput } from '@/components/ui/ime-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AdminConfiguration, Major, Subject, SubjectClass } from '@/lib/core/models/configuration.model';
import { useToast } from '@/lib/hooks/use-toast';
import { generateMajorCode, generateSubjectCode, generateClassCode } from '@/lib/utils/code-generator';
import { configurationService } from '@/services/configuration.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  GraduationCap,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function Configuration(): React.JSX.Element {
  const [showDisabled, setShowDisabled] = useState(true);
  const [foldedMajors, setFoldedMajors] = useState<Set<number>>(new Set());
  const [foldedSubjects, setFoldedSubjects] = useState<Set<string>>(new Set());
  const [foldedClasses, setFoldedClasses] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch configuration
  const {
    data: configuration = { majors: [] },
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['configuration'],
    queryFn: () => configurationService.getConfiguration(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Mutation to save configuration
  const saveConfigurationMutation = useMutation({
    mutationFn: (config: AdminConfiguration) => configurationService.saveConfiguration(config),
    onSuccess: (_, variables) => {
      // Update the cache with the cleaned configuration
      queryClient.setQueryData(['configuration'], variables);
      toast({
        title: 'Success',
        description: 'Configuration saved successfully'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      });
    }
  });

  // Show error toast if query fails
  useEffect(() => {
    if (!error) return;

    toast({
      title: 'Error',
      description: 'Failed to load configuration',
      variant: 'destructive'
    });
  }, [error, toast]);

  // Helper function to update configuration in cache
  const updateConfiguration = (updaterFn: (prev: AdminConfiguration) => AdminConfiguration): void => {
    queryClient.setQueryData(['configuration'], updaterFn);
  };

  // Fold/unfold utility functions
  const toggleMajorFold = (majorIndex: number): void => {
    setFoldedMajors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(majorIndex)) {
        newSet.delete(majorIndex);
      } else {
        newSet.add(majorIndex);
      }
      return newSet;
    });
  };

  const toggleSubjectFold = (majorIndex: number, subjectIndex: number): void => {
    const key = `${majorIndex}-${subjectIndex}`;
    setFoldedSubjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleClassesFold = (majorIndex: number, subjectIndex: number): void => {
    const key = `${majorIndex}-${subjectIndex}-classes`;
    setFoldedClasses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const [isExpandedState, setIsExpandedState] = useState(true);

  const expandAll = (): void => {
    setFoldedMajors(new Set());
    setFoldedSubjects(new Set());
    setFoldedClasses(new Set());
  };

  const collapseAll = (): void => {
    const majorIndices = configuration.majors.map((_, index) => index);
    const subjectKeys: string[] = [];
    const classKeys: string[] = [];

    configuration.majors.forEach((major, majorIndex) => {
      major.subjects.forEach((_, subjectIndex) => {
        subjectKeys.push(`${majorIndex}-${subjectIndex}`);
        classKeys.push(`${majorIndex}-${subjectIndex}-classes`);
      });
    });

    setFoldedMajors(new Set(majorIndices));
    setFoldedSubjects(new Set(subjectKeys));
    setFoldedClasses(new Set(classKeys));
  };

  const toggleExpandCollapseAll = (): void => {
    if (isExpandedState) {
      collapseAll();
    } else {
      expandAll();
    }
    setIsExpandedState(!isExpandedState);
  };

  const cleanAndGenerateCodes = (config: AdminConfiguration): AdminConfiguration => {
    const cleanedMajors = config.majors
      .filter((major) => major.name.trim() !== '') // Remove majors with empty names
      .map((major) => {
        const cleanedSubjects = major.subjects
          .filter((subject) => subject.name.trim() !== '') // Remove subjects with empty names
          .map((subject) => {
            const cleanedClasses = subject.classes
              .filter((subjectClass) => subjectClass.name.trim() !== '') // Remove classes with empty names
              .map((subjectClass) => ({
                ...subjectClass,
                code: subjectClass.code || generateClassCode() // Generate class code if empty
              }));

            return {
              ...subject,
              code: subject.code || generateSubjectCode(), // Generate subject code if empty
              classes: cleanedClasses
            };
          });

        return {
          ...major,
          code: major.code || generateMajorCode(), // Generate major code if empty
          subjects: cleanedSubjects
        };
      });

    return {
      ...config,
      majors: cleanedMajors
    };
  };

  const saveConfiguration = async (): Promise<void> => {
    // Clean and prepare configuration before saving
    const cleanedConfiguration = cleanAndGenerateCodes(configuration);
    saveConfigurationMutation.mutate(cleanedConfiguration);
  };

  const addMajor = (): void => {
    const newMajor: Major = {
      name: '',
      code: '', // Don't generate code until save
      subjects: [],
      disabled: false
    };
    updateConfiguration((prev) => ({
      ...prev,
      majors: [...prev.majors, newMajor]
    }));

    // Scroll to the new major after a short delay to allow DOM update
    setTimeout(() => {
      const newMajorIndex = configuration.majors.length;
      const element = document.getElementById(`major-name-${newMajorIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Don't auto-focus to avoid input conflicts
        // element.focus();
      }
    }, 100);
  };

  const updateMajor = (index: number, field: keyof Major, value: string): void => {
    updateConfiguration((prev) => {
      const newMajors = [...prev.majors];
      newMajors[index] = { ...newMajors[index], [field]: value };
      return { ...prev, majors: newMajors };
    });
  };

  const deleteMajor = (index: number): void => {
    updateConfiguration((prev) => {
      const newMajors = [...prev.majors];
      newMajors[index] = { ...newMajors[index], disabled: !(newMajors[index].disabled ?? false) };
      return { ...prev, majors: newMajors };
    });
  };

  const addSubject = (majorIndex: number): void => {
    const newSubject: Subject = {
      name: '',
      code: '', // Don't generate code until save
      classes: [],
      disabled: false
    };

    updateConfiguration((prev) => {
      const newMajors = [...prev.majors];
      const newSubjects = [...newMajors[majorIndex].subjects, newSubject];
      newMajors[majorIndex] = {
        ...newMajors[majorIndex],
        subjects: newSubjects
      };
      return { ...prev, majors: newMajors };
    });

    // Scroll to the new subject after a short delay to allow DOM update
    const newSubjectIndex = configuration.majors[majorIndex].subjects.length;
    setTimeout(() => {
      const element = document.getElementById(`subject-name-${majorIndex}-${newSubjectIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const updateSubject = (majorIndex: number, subjectIndex: number, field: keyof Subject, value: string): void => {
    updateConfiguration((prev) => {
      const newMajors = [...prev.majors];
      const newSubjects = [...newMajors[majorIndex].subjects];
      newSubjects[subjectIndex] = {
        ...newSubjects[subjectIndex],
        [field]: value
      };
      newMajors[majorIndex] = {
        ...newMajors[majorIndex],
        subjects: newSubjects
      };
      return { ...prev, majors: newMajors };
    });
  };

  const toggleSubject = (majorIndex: number, subjectIndex: number): void => {
    updateConfiguration((prev) => {
      const newMajors = [...prev.majors];
      const newSubjects = [...newMajors[majorIndex].subjects];
      newSubjects[subjectIndex] = {
        ...newSubjects[subjectIndex],
        disabled: !(newSubjects[subjectIndex].disabled ?? false)
      };
      newMajors[majorIndex] = {
        ...newMajors[majorIndex],
        subjects: newSubjects
      };
      return { ...prev, majors: newMajors };
    });
  };

  const addClass = (majorIndex: number, subjectIndex: number): void => {
    const newClass: SubjectClass = {
      name: '',
      code: '', // Don't generate code until save
      disabled: false
    };

    updateConfiguration((prev) => {
      const newMajors = [...prev.majors];
      const newSubjects = [...newMajors[majorIndex].subjects];
      const newClasses = [...newSubjects[subjectIndex].classes, newClass];
      newSubjects[subjectIndex] = {
        ...newSubjects[subjectIndex],
        classes: newClasses
      };
      newMajors[majorIndex] = {
        ...newMajors[majorIndex],
        subjects: newSubjects
      };
      return { ...prev, majors: newMajors };
    });

    // Scroll to the new class after a short delay to allow DOM update
    const newClassIndex = configuration.majors[majorIndex].subjects[subjectIndex].classes.length;
    setTimeout(() => {
      const element = document.getElementById(`class-name-${majorIndex}-${subjectIndex}-${newClassIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const updateClass = (
    majorIndex: number,
    subjectIndex: number,
    classIndex: number,
    field: keyof SubjectClass,
    value: string
  ): void => {
    updateConfiguration((prev) => {
      const newMajors = [...prev.majors];
      const newSubjects = [...newMajors[majorIndex].subjects];
      const newClasses = [...newSubjects[subjectIndex].classes];
      newClasses[classIndex] = {
        ...newClasses[classIndex],
        [field]: value
      };
      newSubjects[subjectIndex] = {
        ...newSubjects[subjectIndex],
        classes: newClasses
      };
      newMajors[majorIndex] = {
        ...newMajors[majorIndex],
        subjects: newSubjects
      };
      return { ...prev, majors: newMajors };
    });
  };

  const deleteClass = (majorIndex: number, subjectIndex: number, classIndex: number): void => {
    updateConfiguration((prev) => {
      const newMajors = [...prev.majors];
      const newSubjects = [...newMajors[majorIndex].subjects];
      const newClasses = [...newSubjects[subjectIndex].classes];
      newClasses[classIndex] = {
        ...newClasses[classIndex],
        disabled: !(newClasses[classIndex].disabled ?? false)
      };
      newSubjects[subjectIndex] = {
        ...newSubjects[subjectIndex],
        classes: newClasses
      };
      newMajors[majorIndex] = {
        ...newMajors[majorIndex],
        subjects: newSubjects
      };
      return { ...prev, majors: newMajors };
    });
  };

  if (loading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-lg'>Loading configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Configuration Management</h1>
          <p className='text-muted-foreground'>Manage majors, subjects, and classes</p>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Button onClick={() => setShowDisabled(!showDisabled)} variant='outline' size='sm'>
              {showDisabled ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              <span className='ml-2 hidden sm:inline'>{showDisabled ? 'Hide Disabled' : 'Show Disabled'}</span>
            </Button>
            <Button onClick={toggleExpandCollapseAll} variant='outline' size='sm'>
              {isExpandedState ? <ChevronRight className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
              <span className='ml-2 hidden sm:inline'>{isExpandedState ? 'Collapse All' : 'Expand All'}</span>
            </Button>
          </div>
          <div className='flex gap-2'>
            <Button onClick={addMajor} variant='outline'>
              <Plus className='w-4 h-4 mr-2' />
              Add Major
            </Button>
            <Button onClick={saveConfiguration} disabled={saveConfigurationMutation.isPending}>
              <Save className='w-4 h-4 mr-2' />
              {saveConfigurationMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        {configuration.majors.map((major, majorIndex) => {
          // Skip disabled items if toggle is off
          if (!showDisabled && (major.disabled ?? false)) {
            return null;
          }

          return (
            <Card
              key={`major-${majorIndex}`}
              className={`w-full ${major.disabled ?? false ? 'opacity-60 bg-muted/50' : ''}`}
            >
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleMajorFold(majorIndex)}
                      className='h-auto p-1'
                    >
                      {foldedMajors.has(majorIndex) ? (
                        <ChevronRight className='w-4 h-4' />
                      ) : (
                        <ChevronDown className='w-4 h-4' />
                      )}
                    </Button>
                    <GraduationCap className='w-5 h-5' />
                    <span>Major #{majorIndex + 1}</span>
                    {(major.disabled ?? false) && <span className='text-sm text-muted-foreground'>(Disabled)</span>}
                  </div>
                  <Button
                    onClick={() => deleteMajor(majorIndex)}
                    variant={major.disabled ?? false ? 'outline' : 'destructive'}
                    size='sm'
                  >
                    {major.disabled ?? false ? (
                      <>
                        <RotateCcw className='w-4 h-4' />
                        <span className='ml-2 hidden sm:inline'>Restore</span>
                      </>
                    ) : (
                      <Trash2 className='w-4 h-4' />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              {!foldedMajors.has(majorIndex) && (
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor={`major-name-${majorIndex}`}>Major Name</Label>
                      <IMEInput
                        id={`major-name-${majorIndex}`}
                        value={major.name}
                        onChange={(value) => updateMajor(majorIndex, 'name', value)}
                        placeholder='Enter major name'
                        disabled={major.disabled ?? false}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`major-code-${majorIndex}`}>Major Code</Label>
                      <Input
                        id={`major-code-${majorIndex}`}
                        value={major.code}
                        readOnly
                        placeholder='MAJ_DD_MM_YY_XXXXXX'
                        className='bg-muted'
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-lg font-semibold flex items-center gap-2'>
                        <BookOpen className='w-4 h-4' />
                        Subjects
                      </h4>
                      <Button
                        onClick={() => addSubject(majorIndex)}
                        variant='outline'
                        size='sm'
                        disabled={major.disabled ?? false}
                      >
                        <Plus className='w-4 h-4 mr-2' />
                        Add Subject
                      </Button>
                    </div>

                    {major.subjects.map((subject, subjectIndex) => {
                      // Skip disabled subjects if toggle is off
                      if (!showDisabled && (subject.disabled ?? false)) {
                        return null;
                      }

                      return (
                        <Card
                          key={`subject-${majorIndex}-${subjectIndex}`}
                          className={`ml-4 ${subject.disabled ?? false ? 'opacity-60 bg-muted/50' : ''}`}
                        >
                          <CardHeader>
                            <CardTitle className='flex items-center justify-between text-base'>
                              <div className='flex items-center gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => toggleSubjectFold(majorIndex, subjectIndex)}
                                  className='h-auto p-1'
                                >
                                  {foldedSubjects.has(`${majorIndex}-${subjectIndex}`) ? (
                                    <ChevronRight className='w-3 h-3' />
                                  ) : (
                                    <ChevronDown className='w-3 h-3' />
                                  )}
                                </Button>
                                <span>Subject #{subjectIndex + 1}</span>
                                {(subject.disabled ?? false) && (
                                  <span className='text-sm text-muted-foreground'>(Disabled)</span>
                                )}
                              </div>
                              <Button
                                onClick={() => toggleSubject(majorIndex, subjectIndex)}
                                variant={subject.disabled ?? false ? 'outline' : 'destructive'}
                                size='sm'
                              >
                                {subject.disabled ?? false ? (
                                  <>
                                    <RotateCcw className='w-4 h-4' />
                                    <span className='ml-2 hidden sm:inline'>Restore</span>
                                  </>
                                ) : (
                                  <Trash2 className='w-4 h-4' />
                                )}
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          {!foldedSubjects.has(`${majorIndex}-${subjectIndex}`) && (
                            <CardContent className='space-y-4'>
                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                  <Label htmlFor={`subject-name-${majorIndex}-${subjectIndex}`}>Subject Name</Label>
                                  <IMEInput
                                    id={`subject-name-${majorIndex}-${subjectIndex}`}
                                    value={subject.name}
                                    onChange={(value) => {
                                      updateSubject(majorIndex, subjectIndex, 'name', value);
                                    }}
                                    placeholder='Enter subject name'
                                    disabled={subject.disabled ?? false}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`subject-code-${majorIndex}-${subjectIndex}`}>Subject Code</Label>
                                  <Input
                                    id={`subject-code-${majorIndex}-${subjectIndex}`}
                                    value={subject.code}
                                    readOnly
                                    placeholder='SUB_DD_MM_YY_XXXXXX'
                                    className='bg-muted'
                                  />
                                </div>
                              </div>

                              <div className='space-y-4'>
                                <div className='flex items-center justify-between'>
                                  <div className='flex items-center gap-2'>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => toggleClassesFold(majorIndex, subjectIndex)}
                                      className='h-auto p-1'
                                    >
                                      {foldedClasses.has(`${majorIndex}-${subjectIndex}-classes`) ? (
                                        <ChevronRight className='w-3 h-3' />
                                      ) : (
                                        <ChevronDown className='w-3 h-3' />
                                      )}
                                    </Button>
                                    <h5 className='text-md font-medium flex items-center gap-2'>
                                      <Users className='w-4 h-4' />
                                      Classes
                                    </h5>
                                  </div>
                                  <Button
                                    onClick={() => addClass(majorIndex, subjectIndex)}
                                    variant='outline'
                                    size='sm'
                                    disabled={subject.disabled ?? false}
                                  >
                                    <Plus className='w-4 h-4 mr-2' />
                                    Add Class
                                  </Button>
                                </div>

                                {!foldedClasses.has(`${majorIndex}-${subjectIndex}-classes`) && (
                                  <div className='space-y-2'>
                                    {subject.classes.map((subjectClass, classIndex) => {
                                      // Skip disabled classes if toggle is off
                                      if (!showDisabled && (subjectClass.disabled ?? false)) {
                                        return null;
                                      }

                                      return (
                                        <div
                                          key={`class-${majorIndex}-${subjectIndex}-${classIndex}`}
                                          className={`ml-4 p-4 border rounded-lg space-y-2 ${
                                            subjectClass.disabled ?? false ? 'opacity-60 bg-muted/50' : ''
                                          }`}
                                        >
                                          <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                              <span className='text-sm font-medium'>Class #{classIndex + 1}</span>
                                              {(subjectClass.disabled ?? false) && (
                                                <span className='text-xs text-muted-foreground'>(Disabled)</span>
                                              )}
                                            </div>
                                            <Button
                                              onClick={() => deleteClass(majorIndex, subjectIndex, classIndex)}
                                              variant={subjectClass.disabled ?? false ? 'outline' : 'destructive'}
                                              size='sm'
                                            >
                                              {subjectClass.disabled ?? false ? (
                                                <>
                                                  <RotateCcw className='w-4 h-4' />
                                                  <span className='ml-2 hidden sm:inline'>Restore</span>
                                                </>
                                              ) : (
                                                <Trash2 className='w-4 h-4' />
                                              )}
                                            </Button>
                                          </div>
                                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div>
                                              <Label htmlFor={`class-name-${majorIndex}-${subjectIndex}-${classIndex}`}>
                                                Class Name
                                              </Label>
                                              <IMEInput
                                                id={`class-name-${majorIndex}-${subjectIndex}-${classIndex}`}
                                                value={subjectClass.name}
                                                onChange={(value) =>
                                                  updateClass(majorIndex, subjectIndex, classIndex, 'name', value)
                                                }
                                                placeholder='Enter class name'
                                                disabled={subjectClass.disabled ?? false}
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor={`class-code-${majorIndex}-${subjectIndex}-${classIndex}`}>
                                                Class Code
                                              </Label>
                                              <Input
                                                id={`class-code-${majorIndex}-${subjectIndex}-${classIndex}`}
                                                value={subjectClass.code}
                                                readOnly
                                                placeholder='CLS_DD_MM_YY_XXXXXX'
                                                className='bg-muted'
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {configuration.majors.length === 0 && (
        <Card className='w-full'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <GraduationCap className='w-12 h-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No majors configured</h3>
            <p className='text-muted-foreground mb-4'>Start by adding your first major</p>
            <Button onClick={addMajor}>
              <Plus className='w-4 h-4 mr-2' />
              Add Major
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
