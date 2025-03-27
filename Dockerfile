FROM public.ecr.aws/lambda/nodejs:20.11.1

RUN yum install -y git

WORKDIR ${LAMBDA_TASK_ROOT}

RUN git clone -b master https://github.com/OptiQuantTeam/BackEnd.git

RUN npm install

CMD ["index.handler"]