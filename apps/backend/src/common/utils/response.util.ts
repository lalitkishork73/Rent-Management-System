export const successResponse = (message: string, data: any = {}) => {
  return {
    success: true,
    message,
    data,
  };
};

export const errorResponse = (message: string, error: any = {}) => {
  return {
    success: false,
    message,
    error,
  };
};


export const paginateResponse = (items: any[], total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data: items,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    message: 'Data fetched successfully',
  };
};

