import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { IBlog } from '../interfaces/blogs';
import { ISingleBlog } from '../interfaces/singleBlog';
import { BlogsService } from '../service/blogs.service';

export const blogDetailsResolver: ResolveFn<Observable<ISingleBlog | null>> = (
  route
) => {
  const blogsService = inject(BlogsService);
  const slug = route.paramMap.get('slug');

  if (!slug) {
    return of(null);
  }

  return blogsService.getBlogById(slug).pipe(
    switchMap((response: any) => {
      // If response already has the expected structure
      if (response && response.blog) {
        return of(response as ISingleBlog);
      }

      // If we got a single blog in the response
      if (response && !Array.isArray(response)) {
        // We need to fetch all blogs to get related blogs
        return blogsService.getAllBlogs().pipe(
          map((allBlogsResponse: any) => {
            let allBlogs: IBlog[] = [];

            if (
              allBlogsResponse &&
              allBlogsResponse.rows &&
              Array.isArray(allBlogsResponse.rows.data)
            ) {
              allBlogs = allBlogsResponse.rows.data;
            } else if (Array.isArray(allBlogsResponse)) {
              allBlogs = allBlogsResponse;
            }

            // Filter out the current blog from related blogs
            const relatedBlogs = allBlogs.filter(
              (blog: IBlog) =>
                blog.id !== response.id &&
                blog.en_slug !== slug &&
                blog.ar_slug !== slug
            );

            return {
              blog: response,
              blogs: relatedBlogs,
            } as ISingleBlog;
          })
        );
      }

      return of(null);
    }),
    catchError((error) => {
      console.error('Error in blog details resolver:', error);
      return of(null);
    })
  );
};
